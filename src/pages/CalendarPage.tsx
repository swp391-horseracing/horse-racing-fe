import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import listPlugin from '@fullcalendar/list';
import timeGridPlugin from "@fullcalendar/timegrid";
import multiMonthPlugin from "@fullcalendar/multimonth";
import type {DayCellContentArg, EventContentArg} from "@fullcalendar/core";
import {useEvent} from "../hooks/useEvent.ts";

export default function CalendarPage() {
    const {eventList} = useEvent();
    console.log(eventList);
    return (
        <div className="bg-white p-4 rounded-xl shadow">

            <FullCalendar
                plugins={[dayGridPlugin,
                    timeGridPlugin,
                    listPlugin,
                    multiMonthPlugin]}
                headerToolbar={{
                    left: "prev,next today",
                    center: "title",
                    right: "dayGridMonth,timeGridWeek,timeGridDay,multiMonthYear,listWeek"
                }}
                initialView="dayGridMonth"
                dayCellClassNames={dayCellColor}
                dayHeaderClassNames="bg-indigo-300"
                eventClassNames={eventColor}
                events={eventList}
                height="99%"
            />
        </div>
    );
}

const dayCellColor = (arg:DayCellContentArg) => {
    let custom = "hover: bg-indigo-500";
    if (arg.isToday) custom = "hover: bg-indigo-600";
    else custom = "hover: bg-indigo-700";
    return custom;
}

const eventColor = (arg: EventContentArg) => {
    const priority = arg.event.extendedProps.priority;

    if (priority === 3) return "!bg-red-800";
    if (priority === 2) return "!bg-blue-500";
    return "!bg-emerald-500";
}