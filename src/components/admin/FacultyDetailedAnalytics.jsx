import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Divider,
  Button
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { useRef } from 'react'
import api from '../../api/api'

/* ---------------- QUESTIONS ---------------- */

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
  { id: 'l8', text: 'Time allotted for lab sessions is sufficient.' },
  { id: 'l9', text: 'Assessment of lab performance is fair and transparent.' },
  { id: 'l10', text: 'Overall effectiveness of the lab sessions is satisfactory.' }
]

const RATING_MEANING = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
}

const RATING_COLOR = {
  1: '#DC2626',
  2: '#F97316',
  3: '#EAB308',
  4: '#22C55E',
  5: '#16A34A'
}

/* ---------------- COMPONENT ---------------- */

export default function FacultyDetailedAnalytics() {
  const { facultyId } = useParams()
  const navigate = useNavigate()
  const { search } = useLocation()
  const params = new URLSearchParams(search)

  const course = params.get('course')
  const semester = params.get('semester')
  const year = params.get('year')
  const section = params.get('section')

  const [faculty, setFaculty] = useState(null)
  const [subjectTab, setSubjectTab] = useState(0)
  const [typeTab, setTypeTab] = useState(0)
  const pdfRef = useRef()
  useEffect(() => {
    fetchDetails()
  }, [])

  // 🔥 reset tab when data changes
  useEffect(() => {
    setSubjectTab(0)
  }, [faculty])

  const fetchDetails = async () => {
    const res = await api.get(`/admin/analytics/faculty/${facultyId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('adminToken')}`
      },
      params: { course, semester, year, section }
    })
    setFaculty(res.data)
  }

  if (!faculty) return <Typography sx={{ p: 4 }}>Loading...</Typography>

  // ✅ SAFE SUBJECT ACCESS
  const subject =
    faculty.subjects && faculty.subjects.length > 0
      ? faculty.subjects[subjectTab] || faculty.subjects[0]
      : null

  const isTheory = typeTab === 0
  const feedback = isTheory ? subject?.theory : subject?.lab
  const questions = isTheory ? THEORY_QUESTIONS : LAB_QUESTIONS
  const handleDownloadPDF = async () => {
  const input = pdfRef.current
  if (!input) return

  const canvas = await html2canvas(input, {
    scale: 2,
    useCORS: true
  })

  const imgData = canvas.toDataURL('image/png')

  const pdf = new jsPDF('p', 'mm', 'a4')

  const pageWidth = 210
  const pageHeight = 295

  const imgWidth = pageWidth
  const imgHeight = (canvas.height * imgWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  // 🕒 GENERATED DATE & TIME
  const now = new Date()
  const dateTime = now.toLocaleString() // full date + time

  // 📌 ADD HEADER TEXT (TOP RIGHT)
  pdf.setFontSize(9)
  pdf.text(`Generated: ${dateTime}`, pageWidth - 10, 10, { align: 'right' })

  // 📸 ADD IMAGE
  pdf.addImage(imgData, 'PNG', 0, 15, imgWidth, imgHeight)
  heightLeft -= pageHeight

  // 🔁 MULTI PAGE SUPPORT
  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()

    // repeat header on every page
    pdf.setFontSize(9)
    pdf.text(`Generated: ${dateTime}`, pageWidth - 10, 10, { align: 'right' })

    pdf.addImage(imgData, 'PNG', 0, position + 15, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  const fileName = `${faculty.name}_${course}_Sem${semester}.pdf`
  pdf.save(fileName)
}
  return (
    <Box sx={{ p: 4 }} ref={pdfRef}>
      {/* HEADER */}
      <Box sx={{ textAlign: 'center', mb: 2 }}>
        <img
          src="/logo.jpg"
          alt="Rayalaseema University"
          style={{ width: 80, height: 80 }}
        />

        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          Rayalaseema University
        </Typography>

        <Typography variant="body2">
          Kurnool, Andhra Pradesh.
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2
        }}
      >
        {/* LEFT SIDE (TITLE) */}
        <Typography variant="h5" fontWeight="bold">
          Faculty Detailed Feedback Report
        </Typography>

        {/* RIGHT SIDE (BUTTONS) */}
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#0B3C5D' }}
            onClick={handleDownloadPDF}
          >
            Download PDF
          </Button>

          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>
      </Box>
      <Typography sx={{ mb: 3, color: '#0B3C5D' }}>
        <b>{faculty.name}</b> ({faculty.designation}) <br />
        {faculty.department} | {course} | Semester {semester} | {year} |
        Section: <b>{section === 'NULL' ? 'No Section' : section || 'All'}</b>
      </Typography>

      {/* SUBJECT TABS */}
      <Tabs
        value={subjectTab}
        onChange={(e, v) => {
          setSubjectTab(v)
          setTypeTab(0)
        }}
        sx={{ mb: 2 }}
      >
        {faculty.subjects?.map((s, i) => (
          <Tab
            key={i}
            label={`${s.subject_name} (${s.section || 'No Section'})`}
          />
        ))}
      </Tabs>

      {/* TYPE TABS */}
      <Tabs
        value={typeTab}
        onChange={(e, v) => setTypeTab(v)}
        sx={{ mb: 2 }}
      >
        <Tab label="Theory" />
        <Tab label="Lab" />
      </Tabs>

      <Paper elevation={4} sx={{ p: 3 }}>
        {subject && (
          <Typography variant="h6" sx={{ mb: 2 }}>
            {subject.subject_name} ({subject.section || 'No Section'}) – {isTheory ? 'Theory' : 'Lab'}
          </Typography>
        )}

        {!feedback?.students?.length ? (
          <Typography>No feedback available</Typography>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell><b>Student</b></TableCell>
                <TableCell><b>Feedback Questions & Ratings</b></TableCell>
                <TableCell><b>Average</b></TableCell>
                <TableCell><b>Comments</b></TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {feedback.students.map((s, idx) => {
                const avg = Number(s.avgRating || 0)

                return (
                  <TableRow key={idx}>
                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <Typography fontWeight="bold">
                        {s.student_name}
                      </Typography>
                      <Typography variant="body2">
                        {s.hall_ticket}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ verticalAlign: 'top' }}>
                      {questions.map((q, i) => {
                        const r = Number(s.ratings?.[q.id] || 0)
                        return (
                          <Box key={q.id} sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              {i + 1}. {q.text}
                            </Typography>

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Box
                                sx={{
                                  width: `${r * 16}px`,
                                  height: 6,
                                  borderRadius: 3,
                                  backgroundColor: RATING_COLOR[r] || '#E5E7EB'
                                }}
                              />
                              <Typography
                                variant="caption"
                                sx={{ color: RATING_COLOR[r] || 'text.secondary' }}
                              >
                                <b>{r}</b> / 5 {r ? `(${RATING_MEANING[r]})` : ''}
                              </Typography>
                            </Box>
                          </Box>
                        )
                      })}
                    </TableCell>

                    <TableCell sx={{ verticalAlign: 'top' }}>
                      <b>{avg.toFixed(2)}</b>
                    </TableCell>

                    <TableCell sx={{ verticalAlign: 'top' }}>
                      {s.comment || '—'}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </Paper>


    </Box>
  )
}