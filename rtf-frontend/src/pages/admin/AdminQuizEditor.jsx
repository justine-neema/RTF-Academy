import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { adminQuizApi } from '../../services/api.js'
import { useAuth } from '../../context/AuthContext.jsx'
import Button from '../../components/common/Button.jsx'

export default function AdminQuizEditor() {
  const { moduleId } = useParams()
  const { getToken } = useAuth()

  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Quiz form state
  const [quizTitle, setQuizTitle] = useState('')
  const [passingThreshold, setPassingThreshold] = useState(80)

  // New question state
  const defaultChoices = [
    { choice_text: '', is_correct: true },
    { choice_text: '', is_correct: false },
    { choice_text: '', is_correct: false },
    { choice_text: '', is_correct: false }
  ]
  const [newQuestionText, setNewQuestionText] = useState('')
  const [newChoices, setNewChoices] = useState(defaultChoices)

  // Load quiz data
  async function loadQuiz() {
    setLoading(true)
    try {
      const token = await getToken()

      // Find quiz by module ID
      const allQuizzes = await adminQuizApi.getQuizzes(token)
      const moduleQuiz = allQuizzes.find(q => q.module === moduleId)

      if (moduleQuiz) {
        // Fetch full question nested data
        const fullQuiz = await adminQuizApi.getQuiz(moduleQuiz.id, token)
        setQuiz(fullQuiz)
        setQuizTitle(fullQuiz.title)
        setPassingThreshold(fullQuiz.passing_threshold)
      } else {
        setQuiz(null)
      }
    } catch (err) {
      console.error('Failed to load quiz:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadQuiz()
  }, [moduleId])

  // Create quiz
  async function handleCreateQuiz() {
    setSaving(true)
    try {
      const token = await getToken()
      await adminQuizApi.createQuiz(moduleId, {
        title: quizTitle,
        passing_threshold: Number(passingThreshold)
      }, token)
      await loadQuiz()
    } catch (err) {
      alert(err.message || 'Failed to create quiz.')
    }
    setSaving(false)
  }

  // Add question
  async function handleAddQuestion() {
    if (!newQuestionText.trim()) return alert('Question text required.')

    // Ensure correct choice exists
    const hasCorrect = newChoices.some(c => c.is_correct)
    if (!hasCorrect) return alert('Select at least one correct answer.')

    const validChoices = newChoices.filter(c => c.choice_text.trim() !== '')
    if (validChoices.length < 2) return alert('Provide at least 2 choices.')

    setSaving(true)
    try {
      const token = await getToken()
      await adminQuizApi.createQuestion(quiz.id, {
        question_text: newQuestionText,
        choices: validChoices
      }, token)

      // Reset form
      setNewQuestionText('')
      setNewChoices(defaultChoices)
      await loadQuiz()
    } catch (err) {
      alert('Failed to add question.')
    }
    setSaving(false)
  }

  // Delete question
  async function handleDeleteQuestion(qId) {
    if (!window.confirm('Delete this question?')) return
    try {
      const token = await getToken()
      await adminQuizApi.deleteQuestion(qId, token)
      await loadQuiz()
    } catch (err) {
      alert('Failed to delete question.')
    }
  }

  // Update choice text
  const updateChoice = (index, text) => {
    const updated = [...newChoices]
    updated[index].choice_text = text
    setNewChoices(updated)
  }

  // Set correct choice
  const setCorrectChoice = (index) => {
    const updated = newChoices.map((c, i) => ({
      ...c,
      is_correct: i === index
    }))
    setNewChoices(updated)
  }

  if (loading) return <p className="text-center py-16 text-gray-400">Loading editor...</p>

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-navy">Module Quiz Editor</h1>
        {/* Route corrected below */}
        <Link to="/admin/quizzes" className="text-sm font-semibold text-[#D19A30] hover:underline">
          &larr; Back to Quizzes
        </Link>
      </div>

      {!quiz ? (
        // Create Quiz Form
        <div className="bg-white border border-[#D19A30]/40 rounded-2xl shadow-sm p-6 max-w-lg">
          <h2 className="text-lg font-bold text-navy mb-4">Create Quiz for Module</h2>
          <div className="mb-4">
            <label className="block text-xs font-bold text-navy mb-1.5">Quiz Title</label>
            <input
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#D19A30] focus:ring-1 focus:ring-[#D19A30]"
              value={quizTitle}
              onChange={e => setQuizTitle(e.target.value)}
              placeholder="e.g. Networking Fundamentals Quiz"
            />
          </div>
          <div className="mb-6">
            <label className="block text-xs font-bold text-navy mb-1.5">Passing Threshold (%)</label>
            <input
              type="number"
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#D19A30] focus:ring-1 focus:ring-[#D19A30]"
              value={passingThreshold}
              onChange={e => setPassingThreshold(e.target.value)}
            />
          </div>
          <Button onClick={handleCreateQuiz} disabled={saving || !quizTitle.trim()}>
            {saving ? 'Creating...' : 'Create Quiz'}
          </Button>
        </div>
      ) : (
        // Quiz Details & Questions Builder
        <div className="space-y-8">
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-navy">{quiz.title}</h2>
              <p className="text-sm text-gray-500 mt-1">Passing threshold: {quiz.passing_threshold}%</p>
            </div>
            <div className="text-sm font-bold bg-[#D19A30]/10 text-[#D19A30] px-3 py-1 rounded-lg">
              {quiz.questions?.length || 0} Questions
            </div>
          </div>

          {/* Existing Questions List */}
          <div className="space-y-4">
            {quiz.questions?.map((q, i) => (
              <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-bold text-navy text-sm">
                    {i + 1}. {q.question_text}
                  </h3>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="text-xs text-red-500 hover:text-red-700 font-semibold">
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {q.choices?.map(c => (
                    <div key={c.id} className={`p-2 rounded border text-sm ${c.is_correct ? 'border-green-400 bg-green-50 text-green-800' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                      {c.is_correct && <span className="font-bold mr-2">✓</span>}
                      {c.choice_text}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add New Question Form */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-navy mb-4">Add a New Question</h3>
            <div className="mb-4">
              <label className="block text-xs font-bold text-navy mb-1.5">Question Text</label>
              <textarea
                rows={2}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#D19A30] focus:ring-1 focus:ring-[#D19A30]"
                value={newQuestionText}
                onChange={e => setNewQuestionText(e.target.value)}
                placeholder="e.g. What does LAN stand for?"
              />
            </div>

            <label className="block text-xs font-bold text-navy mb-2">Answer Choices (Select the correct one)</label>
            <div className="space-y-2 mb-6">
              {newChoices.map((choice, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="correct_choice"
                    checked={choice.is_correct}
                    onChange={() => setCorrectChoice(idx)}
                    className="w-4 h-4 text-[#D19A30] focus:ring-[#D19A30]"
                  />
                  <input
                    type="text"
                    className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:border-[#D19A30] focus:ring-1 focus:ring-[#D19A30]"
                    value={choice.choice_text}
                    onChange={e => updateChoice(idx, e.target.value)}
                    placeholder={`Choice ${idx + 1}`}
                  />
                </div>
              ))}
            </div>

            <Button onClick={handleAddQuestion} disabled={saving || !newQuestionText.trim()}>
              {saving ? 'Adding...' : 'Add Question'}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}