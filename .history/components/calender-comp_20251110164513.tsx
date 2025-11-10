"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { Calendar } from "primereact/calendar"
import { InputText } from "primereact/inputtext"
import { Button } from "primereact/button"
import { InputSwitch } from "primereact/inputswitch"
import "primereact/resources/themes/saga-blue/theme.css"
import "primereact/resources/primereact.min.css"
import "primeicons/primeicons.css"

type DateTimeRange = {
  startDate: Date | null
  endDate: Date | null
  startTime: string
  endTime: string
  timeRangeEnabled: boolean
}

/**
 * UPDATED NOTES:
 * - Calendar now allows typing: readOnlyInput={false}
 * - Time fields: editable text + explicit AM/PM select to avoid ambiguous input
 * - InputSwitch onChange simplified (e.value)
 * - parse/normalize time accepts "HH:MM" and "HH:MM AM/PM"
 * - preserveTime handles null source dates more defensively
 */

export default function PrimeRangeCalendar() {
  const [startDate, setStartDate] = useState<Date | null>(new Date(2025, 11, 15, 12, 0))
  const [endDate, setEndDate] = useState<Date | null>(new Date(2025, 11, 24, 23, 59))

  // Keep times as a single string but provide an explicit AM/PM selector
  const [startTime, setStartTime] = useState(formatTimeForInputs(new Date(2025, 11, 15, 12, 0)))
  const [startIsPM, setStartIsPM] = useState<boolean>(true)
  const [endTime, setEndTime] = useState(formatTimeForInputs(new Date(2025, 11, 24, 23, 59)))
  const [endIsPM, setEndIsPM] = useState<boolean>(true)

  const [timeRangeEnabled, setTimeRangeEnabled] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11))
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState<Date | null>(null)
  const calendarRef = useRef<HTMLDivElement | null>(null)

  const durationText = useMemo(() => {
    if (!startDate || !endDate) return ""
    const diffMs = endDate.getTime() - startDate.getTime()
    if (diffMs < 0) return "End must be after start"
    const minutes = Math.floor(diffMs / (1000 * 60))
    const days = Math.floor(minutes / (60 * 24))
    const hours = Math.floor((minutes - days * 24 * 60) / 60)
    const mins = minutes - days * 24 * 60 - hours * 60
    return `${days} days, ${hours} hours, ${mins} minutes selected`
  }, [startDate, endDate])

  const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  const getFirstDayOfMonth = (date: Date) => (new Date(date.getFullYear(), date.getMonth(), 1).getDay() + 6) % 7

  const isSameDay = (a?: Date | null, b?: Date | null) => !!a && !!b && a.toDateString() === b.toDateString()
  const isStart = (day: number) => isSameDay(startDate, new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
  const isEnd = (day: number) => isSameDay(endDate, new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))
  const isDateSelected = (day: number) => isStart(day) || isEnd(day)

  const isDateInRange = (day: number) => {
    if (!startDate || !endDate) return false
    const date = stripTime(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))!
    const rangeStart = stripTime(startDate)!
    const rangeEnd = stripTime(endDate)!
    const from = rangeStart < rangeEnd ? rangeStart : rangeEnd
    const to = rangeStart < rangeEnd ? rangeEnd : rangeStart
    return date > from && date < to
  }
  const handleMouseDown = (day: number) => {
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    setIsDragging(true)
    setDragStart(date)

    const s = timeRangeEnabled ? preserveTime(date, startDate) : setTimeOnDate(date, 0, 0, false)
    const e = timeRangeEnabled ? preserveTime(date, endDate) : setTimeOnDate(date, 23, 59, true)
    setStartDate(s)
    setEndDate(e)

    setStartTime(formatTimeForInputs(s))
    setStartIsPM(s ? s.getHours() >= 12 : false)
    setEndTime(formatTimeForInputs(e))
    setEndIsPM(e ? e.getHours() >= 12 : true)
  }

  const handleMouseOver = (day: number) => {
    if (!isDragging || !dragStart) return
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    if (date < dragStart) {
      setStartDate(preserveTime(date, startDate))
      setEndDate(preserveTime(dragStart, endDate))
    } else {
      setStartDate(preserveTime(dragStart, startDate))
      setEndDate(preserveTime(date, endDate))
    }
  }

  const handleMouseUp = () => setIsDragging(false)

  const handlePreviousMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  const handleNextMonth = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))

  function onStartPickerChange(e: any) {
    const date: Date | null = e.value
    if (!date) return
    const dt = timeRangeEnabled ? preserveTime(date, startDate) : setTimeOnDate(date, 0, 0, false)
    setStartDate(dt)
    setStartTime(formatTimeForInputs(dt))
    setStartIsPM(dt.getHours() >= 12)
    setCurrentMonth(new Date(dt.getFullYear(), dt.getMonth()))
  }

  function onEndPickerChange(e: any) {
    const date: Date | null = e.value
    if (!date) return
    const dt = timeRangeEnabled ? preserveTime(date, endDate) : setTimeOnDate(date, 23, 59, true)
    setEndDate(dt)
    setEndTime(formatTimeForInputs(dt))
    setEndIsPM(dt.getHours() >= 12)
    setCurrentMonth(new Date(dt.getFullYear(), dt.getMonth()))
  }

  useEffect(() => {
    if (!startDate) return
    const parsed = parseTimeInputFlexible(startTime, startIsPM)
    if (parsed) {
      const newStart = setTimeOnDate(startDate, parsed.hours, parsed.minutes, parsed.isPM)
      setStartDate(newStart)
      setStartTime(formatTimeForInputs(newStart))
      setStartIsPM(parsed.isPM)
    }
  }, [startTime, startIsPM])

  useEffect(() => {
    if (!endDate) return
    const parsed = parseTimeInputFlexible(endTime, endIsPM)
    if (parsed) {
      const newEnd = setTimeOnDate(endDate, parsed.hours, parsed.minutes, parsed.isPM)
      setEndDate(newEnd)
      setEndTime(formatTimeForInputs(newEnd))
      setEndIsPM(parsed.isPM)
    }
  }, [endTime, endIsPM])

  const handleReset = () => {
    const newStart = new Date(2025, 11, 15, 12, 0)
    const newEnd = new Date(2025, 11, 24, 23, 59)
    setStartDate(newStart)
    setEndDate(newEnd)
    setStartTime(formatTimeForInputs(newStart))
    setEndTime(formatTimeForInputs(newEnd))
    setStartIsPM(newStart.getHours() >= 12)
    setEndIsPM(newEnd.getHours() >= 12)
    setCurrentMonth(new Date(newStart.getFullYear(), newStart.getMonth()))
    setTimeRangeEnabled(true)
  }

  const handleSave = () => {
    const data: DateTimeRange = {
      startDate,
      endDate,
      startTime: `${startTime}`,
      endTime: `${endTime}`,
      timeRangeEnabled,
    }
    console.log("Saved:", data)
    alert(`Saved!\nStart: ${startDate?.toLocaleString()}\nEnd: ${endDate?.toLocaleString()}`)
  }

  const daysInMonth = getDaysInMonth(currentMonth)
  const firstDay = getFirstDayOfMonth(currentMonth)
  const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7
  const cells: Array<number | null> = Array.from({ length: totalCells }).map((_, idx) => {
    const dayIndex = idx - firstDay + 1
    if (dayIndex < 1 || dayIndex > daysInMonth) return null
    return dayIndex
  })

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className=" bg-white rounded-2xl shadow-lg p-6 w-full max-w-xs">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">Select Date & Time Range</h2>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Date</label>
            <Calendar
              value={startDate}
              onChange={onStartPickerChange}
              showIcon
              dateFormat="dd/mm/yy"
              className="w-full"
              readOnlyInput={false}
              inputClassName="px-2 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time</label>
            <div className="flex gap-1.5">
              <InputText
                value={startTime}
                onChange={(e: any) => setStartTime(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs"
                placeholder="hh:mm"
              />
              <select
                aria-label="Start AM/PM"
                value={startIsPM ? "PM" : "AM"}
                onChange={(e) => setStartIsPM(e.target.value === "PM")}
                className="text-xs px-2 py-1.5 rounded border"
              >
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">End Date</label>
            <Calendar
              value={endDate}
              onChange={onEndPickerChange}
              showIcon
              dateFormat="dd/mm/yy"
              className="w-full"
              readOnlyInput={false}
              inputClassName="px-2 py-1.5 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">End Time</label>
            <div className="flex gap-1.5">
              <InputText
                value={endTime}
                onChange={(e: any) => setEndTime(e.target.value)}
                className="flex-1 px-2 py-1.5 text-xs"
                placeholder="hh:mm"
              />
              <select
                aria-label="End AM/PM"
                value={endIsPM ? "PM" : "AM"}
                onChange={(e) => setEndIsPM(e.target.value === "PM")}
                className="text-xs px-2 py-1.5 rounded border"
              >
                <option>AM</option>
                <option>PM</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 rounded">
          <InputSwitch
            checked={timeRangeEnabled}
            onChange={(e: any) => setTimeRangeEnabled(e.value)}
            aria-label="Toggle time range"
          />
          <label className="text-xs font-medium text-gray-700 cursor-pointer">Time Range</label>
        </div>

        <div ref={calendarRef} className="border border-gray-300 rounded-lg p-4 mb-4 select-none">
          <div className="flex items-center justify-between mb-4">
            <button onClick={handlePreviousMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">◀</button>
            <h3 className="text-sm font-semibold text-gray-900">{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
            <button onClick={handleNextMonth} className="p-1 hover:bg-gray-100 rounded transition-colors">▶</button>
          </div>

          <div className="grid grid-cols-7 gap-0 mb-2 text-center">
            {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
              <div key={d} className="text-xs font-medium text-gray-500 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0">
            {cells.map((maybeDay, idx) => {
              if (maybeDay === null) return <div key={`pad-${idx}`} className="h-8" />

              const day = maybeDay
              const start = isStart(day)
              const end = isEnd(day)
              const inRange = isDateInRange(day)
              const selected = isDateSelected(day)

              return (
                <div key={day} className="relative h-8 flex items-center justify-center">
                  {(inRange || start || end) && (
                    <div
                      className={`absolute inset-0 ${inRange ? "bg-blue-100" : ""} ${(start || end) ? "bg-blue-500" : ""}`}
                      aria-hidden
                      style={{
                        borderTopLeftRadius: start ? 9999 : 0,
                        borderBottomLeftRadius: start ? 9999 : 0,
                        borderTopRightRadius: end ? 9999 : 0,
                        borderBottomRightRadius: end ? 9999 : 0,
                        opacity: start || end ? 1 : 1,
                      }}
                    />
                  )}

                  <button
                    onMouseDown={() => handleMouseDown(day)}
                    onMouseOver={() => handleMouseOver(day)}
                    className={`relative z-10 w-full h-full text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${selected ? "text-white" : inRange ? "text-gray-900" : "text-gray-700"}`}
                    draggable={false}
                    aria-pressed={selected}
                    aria-label={`Day ${day}`}
                  >
                    {day}
                  </button>
                </div>
              )
            })}
          </div>
        </div>

        <div className="flex gap-2 p-3 bg-blue-50 rounded mb-4">
          <i className="pi pi-info-circle text-blue-600 mt-0.5" />
          <p className="text-xs font-medium text-gray-700">{durationText}</p>
        </div>

        <div className="flex justify-end gap-2">
          <Button label="Reset" onClick={handleReset} className="p-button-outlined p-button-sm" />
          <Button label="Save" icon="pi pi-check" onClick={handleSave} className="p-button p-button-sm" />
        </div>
      </div>
    </div>
  )
}


function stripTime(d: Date | null) {
  if (!d) return null
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function preserveTime(datePart: Date, sourceFull: Date | null) {
  if (!sourceFull) return new Date(datePart.getFullYear(), datePart.getMonth(), datePart.getDate(), 12, 0)
  return new Date(
    datePart.getFullYear(),
    datePart.getMonth(),
    datePart.getDate(),
    sourceFull.getHours(),
    sourceFull.getMinutes(),
  )
}

function setTimeOnDate(date: Date, hours12: number, minutes: number, isPM: boolean) {
  let h = hours12 % 12
  if (isPM) h += 12
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), h, minutes)
}


function parseTimeInputFlexible(s: string, fallbackIsPM: boolean) {
  if (!s) return null
  const m = s.match(/^(\d{1,2}):(\d{2})(?:\s*([AaPp][Mm]))?$/)
  if (!m) return null
  let hh = Number.parseInt(m[1], 10)
  const mm = Number.parseInt(m[2], 10)
  const isPM = m[3] ? /^p/i.test(m[3]) : fallbackIsPM
  if (hh < 1) hh = 1
  if (hh > 12) hh = ((hh - 1) % 12) + 1
  return { hours: hh, minutes: mm, isPM }
}

function formatTimeForInputs(d: Date | null) {
  if (!d) return ""
  let hh = d.getHours()
  const mm = d.getMinutes()
  const isPM = hh >= 12
  hh = hh % 12
  if (hh === 0) hh = 12
  return `${pad(hh)}:${pad(mm)} ${isPM ? "PM" : "AM"}`
}

function pad(n: number) { return n.toString().padStart(2, "0") }

const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"]
