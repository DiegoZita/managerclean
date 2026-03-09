import { useState } from "react";
import { Clock, Calendar as CalendarIcon, ChevronDown, MessageSquare, ArrowLeft, Zap } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format, addDays, isSunday, isSameDay, startOfToday, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SchedulingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdvance: (data: SchedulingData) => void;
}

export interface SchedulingData {
    date: string;
    timeSlot: string;
    voltage: string;
    observations: string;
}

const SchedulingModalContent = ({ onClose, onAdvance }: { onClose: () => void; onAdvance: (data: SchedulingData) => void }) => {
    // Default to tomorrow, unless it's Sunday
    const getInitialDate = () => {
        let date = addDays(startOfToday(), 1);
        while (isSunday(date)) {
            date = addDays(date, 1);
        }
        return date;
    };

    const [selectedDate, setSelectedDate] = useState<Date>(getInitialDate());
    const [selectedTime, setSelectedTime] = useState<string>("Manhã");
    const [voltage, setVoltage] = useState<string>("110v");
    const [observations, setObservations] = useState("");
    const [showCalendar, setShowCalendar] = useState(false);

    const formatDateForDisplay = (date: Date) => {
        const today = startOfToday();
        const tomorrow = addDays(today, 1);

        if (isSameDay(date, today)) return `Hoje, ${format(date, "dd/MM")}`;
        if (isSameDay(date, tomorrow)) return `Amanhã, ${format(date, "dd/MM")}`;

        const dateStr = format(date, "EEEE, dd/MM", { locale: ptBR });
        return dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
    };

    return (
        <div className="w-full transition-all duration-300 max-w-[480px] mx-auto pt-6 pb-[68px] min-h-full">
            <div className="space-y-6">
                {/* Header with Back Arrow */}
                <div className="px-4 sm:px-6 flex items-center gap-4">
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors group">
                        <ArrowLeft className="w-6 h-6 text-primary group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Date Selection */}
                <div className="space-y-3">
                    <div className="px-4 sm:px-6 space-y-3">
                        <h2 className="text-xl font-bold text-foreground">Data do serviço:</h2>
                        <div className="flex items-center gap-2">
                            <span key={selectedDate.getTime()} className="text-lg text-muted-foreground">
                                {formatDateForDisplay(selectedDate)}
                            </span>
                            <button
                                onClick={() => setShowCalendar(!showCalendar)}
                                className="text-sm font-medium text-primary flex items-center gap-1 hover:underline"
                            >
                                Alterar data <ChevronDown className={`w-4 h-4 transition-transform ${showCalendar ? 'rotate-180' : ''}`} />
                            </button>
                        </div>
                    </div>

                    {showCalendar && (
                        <div className="mt-2 border rounded-xl p-1 bg-card animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden origin-top scale-[0.98] sm:scale-100">
                            <Calendar
                                mode="single"
                                showOutsideDays={false}
                                selected={selectedDate}
                                onSelect={(date) => {
                                    if (date) {
                                        setSelectedDate(startOfDay(date));
                                        setShowCalendar(false);
                                    }
                                }}
                                numberOfMonths={1}
                                pagedNavigation
                                fromMonth={startOfToday()}
                                disabled={(date) => date < startOfToday() || isSunday(date)}
                                locale={ptBR}
                                className="mx-auto"
                                classNames={{
                                    months: "flex flex-col md:flex-row space-y-2 md:space-x-4 md:space-y-0 justify-center items-start",
                                    nav_button_previous: "absolute left-4 top-4 hover:opacity-100",
                                    nav_button_next: "absolute right-4 top-4 hover:opacity-100",
                                    nav: "static",
                                }}
                            />
                        </div>
                    )}
                </div>

                {/* Time Selection */}
                <div className="px-4 sm:px-6 space-y-4">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Clock className="w-5 h-5 text-primary" />
                        <span>Período Desejado</span>
                    </div>

                    <div className="flex gap-3">
                        {["Manhã", "Tarde"].map((slot) => (
                            <button
                                key={slot}
                                onClick={() => setSelectedTime(slot)}
                                className={`px-8 py-2 rounded-full border-2 transition-all font-semibold ${selectedTime === slot
                                    ? "bg-slate-700 border-slate-700 text-white"
                                    : "bg-white border-muted-foreground/20 text-muted-foreground hover:border-slate-400"
                                    }`}
                            >
                                {slot}
                            </button>
                        ))}
                    </div>

                    <p className="text-sm text-muted-foreground">
                        {selectedTime === "Manhã"
                            ? "O técnico deverá chegar no endereço dentro da faixa de período selecionada manhã entre as 8h00 até 13h00."
                            : "O técnico deverá chegar no endereço dentro da faixa de período selecionada tarde entre as 13h00 até 17h00."}
                    </p>
                </div>

                {/* Voltage Selection */}
                <div className="px-4 sm:px-6 space-y-4">
                    <div className="flex items-center gap-2 text-foreground font-semibold">
                        <Zap className="w-5 h-5 text-primary" />
                        <span>Voltagem da residência</span>
                    </div>
                    <div className="flex gap-3">
                        {["110v", "220v"].map((v) => (
                            <button
                                key={v}
                                onClick={() => setVoltage(v)}
                                className={`px-8 py-2 rounded-full border-2 transition-all font-semibold ${voltage === v
                                    ? "bg-slate-700 border-slate-700 text-white"
                                    : "bg-white border-muted-foreground/20 text-muted-foreground hover:border-slate-400"
                                    }`}
                            >
                                {v}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Observations */}
                <div className="px-4 sm:px-6 space-y-2">
                    <div className="relative">
                        <label className="absolute -top-3 left-3 bg-background px-1 text-xs text-muted-foreground font-medium">
                            Observação
                        </label>
                        <Textarea
                            placeholder=""
                            className="min-h-[120px] rounded-xl border-muted-foreground/30 focus:border-primary focus:ring-primary"
                            value={observations}
                            onChange={(e) => setObservations(e.target.value)}
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="px-4 sm:px-6 flex justify-end pt-8">
                    <Button
                        className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-6 px-12 rounded-xl text-lg uppercase transition-transform active:scale-95"
                        onClick={() => onAdvance({
                            date: formatDateForDisplay(selectedDate),
                            timeSlot: selectedTime,
                            voltage,
                            observations
                        })}
                    >
                        AVANÇAR
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default SchedulingModalContent;
