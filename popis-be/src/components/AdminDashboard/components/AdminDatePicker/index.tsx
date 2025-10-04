'use client'

import { CalendarIcon } from '@heroicons/react/20/solid'
import { subDays, format } from 'date-fns'
import { pl } from 'date-fns/locale'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import './styles.scss'

export function AdminDatePicker({ className }: React.HTMLAttributes<HTMLDivElement>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [date] = useState(() => {
    const fromParam = searchParams.get('from')
    const toParam = searchParams.get('to')

    if (fromParam) {
      return {
        from: new Date(fromParam),
        to: toParam ? new Date(toParam) : undefined,
      }
    }

    return {
      from: subDays(new Date(), 30),
      to: new Date(),
    }
  })

  return (
    <div className={`date-picker ${className || ''}`}>
      <div className="date-picker__display">
        <CalendarIcon className="date-picker__icon" width={20} height={20} />
        {date?.from ? (
          date.to ? (
            <>
              {format(date.from, 'dd MMM yyyy', { locale: pl })} -{' '}
              {format(date.to, 'dd MMM yyyy', { locale: pl })}
            </>
          ) : (
            format(date.from, 'dd MMM yyyy', { locale: pl })
          )
        ) : (
          <span>Wybierz datę</span>
        )}
      </div>
    </div>
  )
}
