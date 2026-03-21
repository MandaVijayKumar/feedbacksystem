import {
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  TextField
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'

/* ================= QUESTIONS ================= */

const THEORY_QUESTIONS = [
  { id: 't1', text: 'The Faculty communicates the course objectives and outcomes clearly.' },
  { id: 't2', text: 'The Faculty demonstrates thorough knowledge of the subject.' },
  { id: 't3', text: 'The Faculty explains concepts in an understandable manner.' },
  { id: 't4', text: 'The Faculty uses appropriate teaching methods (ICT tools, examples, etc.).' },
  { id: 't5', text: 'The Faculty encourages student participation and interaction in class.' },
  { id: 't6', text: 'The Faculty is punctual and regular in conducting classes.' },
  { id: 't7', text: 'The Faculty completes the syllabus within the stipulated time.' },
  { id: 't8', text: 'The Faculty provides opportunities to clarify doubts and questions.' },
  { id: 't9', text: 'The evaluation process is fair and transparent.' },
  { id: 't10', text: 'Overall, the Faculty effectiveness in teaching is satisfactory.' }
]
const LAB_QUESTIONS = [
  { id: 'l1', text: 'The objectives of the lab sessions are clearly explained.' },
  { id: 'l2', text: 'The lab equipment and resources are adequate and functional.' },
  { id: 'l3', text: 'Experiments are clearly demonstrated before execution.' },
  { id: 'l4', text: 'Lab sessions help in understanding practical aspects of the subject.' },
  { id: 'l5', text: 'Safety procedures and guidelines are properly followed in the lab.' },
  { id: 'l6', text: 'Lab manuals/instructions are clear and helpful.' },
  { id: 'l7', text: 'Faculty provides sufficient support and guidance during lab sessions.' },
  { id: 'l8', text: 'Time allotted for lab sessions is sufficient to complete experiments.' },
  { id: 'l9', text: 'Assessment of lab performance is fair and transparent.' },
  { id: 'l10', text: 'Overall effectiveness of the lab sessions is satisfactory.' }
]
/* ================= COMPONENT ================= */

export default function FeedbackForm() {
  const navigate = useNavigate()

  const [facultyList, setFacultyList] = useState([])
  const [subjectList, setSubjectList] = useState([])

  const [faculty, setFaculty] = useState('')
  const [subject, setSubject] = useState('')
  const [feedbackType, setFeedbackType] = useState('')
  const [answers, setAnswers] = useState({})
  const [comments, setComments] = useState('')
  const [submitted, setSubmitted] = useState(false)

  /* ================= LOAD DATA ================= */
  useEffect(() => {
    const token = localStorage.getItem('studentToken')
    if (!token) {
      navigate('/student')
      return
    }

    const loadData = async () => {
      try {
        const res = await api.get('/feedback/faculty-subjects', {
          headers: { Authorization: `Bearer ${token}` }
        })
        console.log(res.data)
        setFacultyList(res.data.faculty)
        setSubjectList(res.data.subjects)
      } catch (err) {
        alert('Failed to load faculty and subjects')
      }
    }

    loadData()
  }, [navigate])

  /* ================= HELPERS ================= */
  const filteredSubjects = subjectList.filter(
    s => s.faculty_id === faculty
  )

  const QUESTIONS =
    feedbackType === 'LAB' ? LAB_QUESTIONS : THEORY_QUESTIONS

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    if (
      !faculty ||
      !subject ||
      !feedbackType ||
      Object.keys(answers).length !== QUESTIONS.length
    ) {
      alert('Please answer all questions')
      return
    }

    try {
      const token = localStorage.getItem('studentToken')

      const res = await api.post(
        '/feedback/submit-feedback',
        {
          facultyId: faculty,
          subjectId: subject,
          type: feedbackType,
          ratings: answers,
          comments
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      )

      alert(res.data.msg || 'Feedback submitted successfully')
      setSubmitted(true)
    } catch (err) {
      alert(err.response?.data?.msg || 'Feedback submission failed')
    }
  }

  const handleAnotherFeedback = () => {
    setFaculty('')
    setSubject('')
    setFeedbackType('')
    setAnswers({})
    setComments('')
    setSubmitted(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('studentToken')
    navigate('/')
  }

  /* ================= UI ================= */
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Paper elevation={4} sx={{ p: 4, width: 650 }}>
        <Typography variant="h6" gutterBottom sx={{ color: '#0B3C5D', fontWeight: 'bold' }}>
          Student Feedback Form
        </Typography>

        {/* FACULTY */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Select Faculty</InputLabel>
          <Select value={faculty} label="Select Faculty"
            onChange={(e) => {
              setFaculty(e.target.value)
              setSubject('')
              setFeedbackType('')
              setAnswers({})
              setComments('')
            }}
          >
            {facultyList.map(f => (
              <MenuItem key={f.faculty_id} value={f.faculty_id}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* SUBJECT */}
        <FormControl fullWidth margin="normal" disabled={!faculty}>
          <InputLabel>Select Subject</InputLabel>
          <Select value={subject} label="Select Subject"
            onChange={(e) => {
              setSubject(e.target.value)
              setFeedbackType('')
              setAnswers({})
              setComments('')
            }}
          >
            {filteredSubjects.map(s => (
              <MenuItem key={s.subject_id} value={s.subject_id}>
                {s.subject_name} (Sem {s.semester})
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* TYPE */}
        <FormControl fullWidth margin="normal" disabled={!subject}>
          <InputLabel>Feedback Type</InputLabel>
          <Select value={feedbackType} label="Feedback Type"
            onChange={(e) => {
              setFeedbackType(e.target.value)
              setAnswers({})
              setComments('')
            }}
          >
            <MenuItem value="THEORY">Theory</MenuItem>
            <MenuItem value="LAB">Lab</MenuItem>
          </Select>
        </FormControl>

        {/* QUESTIONS */}
        {feedbackType && QUESTIONS.map((q, i) => (
          <Box key={q.id} sx={{ mb: 2 }}>
            <Typography>{i + 1}. {q.text}</Typography>
            <RadioGroup
              row
              value={answers[q.id] || ''}
              onChange={(e) =>
                setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))
              }
            >
              <FormControlLabel value="5" control={<Radio />} label="Excellent" />
              <FormControlLabel value="4" control={<Radio />} label="Very Good" />
              <FormControlLabel value="3" control={<Radio />} label="Good" />
              <FormControlLabel value="2" control={<Radio />} label="Average" />
              <FormControlLabel value="1" control={<Radio />} label="Poor" />
            </RadioGroup>
          </Box>
        ))}

        {/* COMMENTS */}
        {feedbackType && (
          <TextField
            label="Additional Comments (Optional)"
            multiline
            rows={4}
            fullWidth
            margin="normal"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        )}

        {/* ACTIONS */}
        {!submitted ? (
          <Button
            variant="contained"
            fullWidth
            sx={{ mt: 3, backgroundColor: '#0B3C5D' }}
            onClick={handleSubmit}
          >
            Submit Feedback
          </Button>
        ) : (
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{ backgroundColor: '#0B3C5D' }}
              onClick={handleAnotherFeedback}
            >
              Submit Another Feedback
            </Button>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleLogout}
            >
              Logout & Go Home
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  )
}
