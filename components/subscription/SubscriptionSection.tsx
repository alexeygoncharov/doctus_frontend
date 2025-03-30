'use client'

import React, { useState, useEffect } from 'react'
import { SubscriptionStatusCard } from './SubscriptionStatusCard'
import { 
  getCurrentSubscription, 
  SubscriptionResponse,
  cancelSubscription,
  getPlans,
  PlanResponse
} from '../../lib/api'
import { formatDate } from '../../lib/utils'
import { PaymentProcessor } from '../payment/PaymentProcessor'
import { CheckCircle } from 'lucide-react'

interface SubscriptionSectionProps {
  onShowPricingModal: () => void
}

export function SubscriptionSection({ onShowPricingModal }: SubscriptionSectionProps) {
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null)
  const [plans, setPlans] = useState<PlanResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cancelLoading, setCancelLoading] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)

  useEffect(() => {
    fetchSubscriptionData()
    fetchPlans()
  }, [])

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      try {
        const subscriptionData = await getCurrentSubscription()
        setSubscription(subscriptionData)
      } catch (error) {
        console.log('No active subscription found')
        setSubscription(null)
      }
    } catch (error: any) {
      console.error('Error fetching subscription data:', error)
      setError('Ошибка при загрузке данных о подписке')
    } finally {
      setLoading(false)
    }
  }

  const fetchPlans = async () => {
    try {
      const plansData = await getPlans()
      setPlans(plansData)
    } catch (error) {
      console.error('Error fetching plans:', error)
    }
  }

  const handleCancelSubscription = async () => {
    if (!confirm('Вы уверены, что хотите отменить подписку?')) {
      return
    }
    
    try {
      setCancelLoading(true)
      await cancelSubscription()
      await fetchSubscriptionData()
    } catch (error: any) {
      console.error('Error canceling subscription:', error)
      alert('Ошибка при отмене подписки')
    } finally {
      setCancelLoading(false)
    }
  }

  const handlePaymentError = (error: any) => {
    setPaymentError(`Ошибка при создании платежа: ${error.message || 'Неизвестная ошибка'}`)
    setTimeout(() => setPaymentError(null), 5000)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchSubscriptionData}
          className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
        >
          Попробовать снова
        </button>
      </div>
    )
  }

  // Если у пользователя есть подписка
  if (subscription) {
    // Получаем преимущества из плана
    const benefits = subscription.plan.description
      ? subscription.plan.description.split('\n').filter(b => b.trim())
      : [
          "Безлимитное количество докторов",
          "Безлимитный доступ к специалистам",
          "Приоритетная поддержка"
        ]

    return (
      <SubscriptionStatusCard
        status="active"
        planName={subscription.plan.name}
        expiryDate={formatDate(subscription.end_date)}
        price={`${subscription.plan.price} ₽`}
        benefits={benefits}
        onChangePlan={onShowPricingModal}
        onCancelSubscription={handleCancelSubscription}
        isCancelDisabled={cancelLoading}
      />
    )
  }

  // Если у пользователя нет подписки - показываем бесплатный тариф
  // и возможность оплатить премиум
  const freePlan = plans.find(p => p.price === 0)
  const premiumPlan = plans.find(p => p.price > 0)
  
  const freeBenefits = freePlan?.description
    ? freePlan.description.split('\n').filter(b => b.trim())
    : [
        "10 сообщений в день",
        "Базовый доступ к терапевту и неврологу",
        "Загрузка до 5 файлов в день"
      ]

  // Получаем дату через 30 дней от текущей
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  
  return (
    <div>
      <SubscriptionStatusCard
        status="free"
        planName={freePlan?.name || "Бесплатный тариф"}
        expiryDate="Бессрочно"
        price="0 ₽"
        benefits={freeBenefits}
        onChangePlan={onShowPricingModal}
      />
      
      {premiumPlan && (
        <div className="mt-8 border-2 border-blue-500 rounded-lg p-6 relative">
          <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
            Рекомендуем
          </div>
          
          <h3 className="text-lg font-medium">{premiumPlan.name}</h3>
          <div className="mt-2 flex items-end">
            <span className="text-3xl font-bold">{premiumPlan.price}₽</span>
            <span className="text-gray-500 ml-1">/месяц</span>
          </div>
          
          <div className="mt-6 space-y-4">
            {premiumPlan.description && premiumPlan.description.split('\n')
              .filter(benefit => benefit.trim().length > 0)
              .map((benefit, index) => (
                <div key={index} className="flex items-start">
                  <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <span className="text-sm text-gray-600">{benefit}</span>
                </div>
              ))
            }
          </div>
          
          <div className="mt-6">
            {paymentError && (
              <div className="mb-4 p-2 bg-red-50 text-red-700 rounded-md text-sm">
                {paymentError}
              </div>
            )}
            
            <PaymentProcessor
              planId={premiumPlan.id}
              periodMonths={1}
              onError={handlePaymentError}
              buttonText="Оформить подписку"
              className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-500 hover:bg-blue-600"
            />
          </div>
        </div>
      )}
    </div>
  )
} 