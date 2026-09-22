import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import OnboardingLayout from './OnboardingLayout'
import { useOnboardingStore } from '../../stores/onboardingStore'
import { supabase } from '../../lib/supabase'

export default function Step3Questions({ onNext, onBack }) {
  const { selectedQuestionIds, toggleQuestion } = useOnboardingStore()
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('questions')
        .select('*')
        .eq('active', true)
      setQuestions(data || [])
      setLoading(false)
    }
    load()
  }, [])

  const canContinue = selectedQuestionIds.length === 3
  const remaining = 3 - selectedQuestionIds.length

  return (
    <OnboardingLayout
      step={3}
      title="Elige 3 preguntas"
      subtitle={
        canContinue
          ? '¡Listo! Ahora respóndelas.'
          : `Te faltan ${remaining} ${remaining === 1 ? 'pregunta' : 'preguntas'}`
      }
      onBack={onBack}
      onNext={onNext}
      canContinue={canContinue}
    >
      {loading ? (
        <div className="text-center py-8 text-text-tertiary text-[12px]">
          Cargando preguntas...
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
          {questions.map((q) => {
            const selected = selectedQuestionIds.includes(q.id)
            const disabled = !selected && selectedQuestionIds.length >= 3

            return (
              <button
                key={q.id}
                onClick={() => toggleQuestion(q.id)}
                disabled={disabled}
                className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                  selected
                    ? 'border-accent bg-accent/8'
                    : disabled
                      ? 'border-border/50 bg-bg-alt/30 opacity-50 cursor-not-allowed'
                      : 'border-border hover:border-accent/40 hover:bg-bg-alt'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    selected
                      ? 'border-accent bg-accent'
                      : 'border-border'
                  }`}
                >
                  {selected && <Check size={12} className="text-bg" strokeWidth={3} />}
                </div>
                <span className="text-[12.5px] text-text-primary leading-snug">
                  {q.text}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </OnboardingLayout>
  )
}