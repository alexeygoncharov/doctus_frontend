'use client'

import React from 'react'
import { CheckCircle } from 'lucide-react'

interface SubscriptionStatusCardProps {
  status: 'active' | 'expired' | 'free'
  planName: string
  expiryDate: string
  price: string
  benefits: string[]
  onChangePlan: () => void
  onCancelSubscription?: () => void
  isCancelDisabled?: boolean
}

export function SubscriptionStatusCard({
  status,
  planName,
  expiryDate,
  price,
  benefits,
  onChangePlan,
  onCancelSubscription,
  isCancelDisabled = false
}: SubscriptionStatusCardProps) {
  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-medium">{planName}</h3>
            <div className="mt-1 flex items-center">
              {status === 'active' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mr-2">
                  Активна
                </span>
              )}
              {status === 'expired' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 mr-2">
                  Истекла
                </span>
              )}
              {status === 'free' && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mr-2">
                  Бесплатный
                </span>
              )}
              <span className="text-sm text-gray-500">
                {status === 'active' ? `Действует до: ${expiryDate}` : expiryDate}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{price}</div>
            {status === 'active' && (
              <div className="text-sm text-gray-500">Текущий тариф</div>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-start">
              <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <span className="text-sm text-gray-600">{benefit}</span>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onChangePlan}
            className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600 transition"
          >
            {status === 'active' ? 'Изменить тариф' : 'Выбрать тариф'}
          </button>
          
          {status === 'active' && onCancelSubscription && (
            <button
              onClick={onCancelSubscription}
              disabled={isCancelDisabled}
              className="flex-1 px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCancelDisabled ? 'Отмена...' : 'Отменить подписку'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 