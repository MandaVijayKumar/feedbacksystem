import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button
} from '@mui/material'
import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import api from '../../api/api'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function FacultyPerformance() {
  const { facultyId } = useParams()
  const navigate = useNavigate()
  const { search } = useLocation()
  const params = new URLSearchParams(search)

  const course = params.get('course')
  const semester = params.get('semester')
  const year = params.get('year')
  const section = params.get('section')

  const [faculty, setFaculty] = useState({ name: '', department: '' })
  const [feedbacks, setFeedbacks] = useState([])
  const [academicYear, setAcademicYear] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) {
      navigate('/admin')
      return
    }
    fetchFacultyPerformance()
  }, [facultyId, navigate])

  const fetchFacultyPerformance = async () => {
    try {
      const token = localStorage.getItem('adminToken')

      const res = await api.get(
        `/admin/analytics/faculty-performance/${facultyId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { course, semester, year, section }
        }
      )

      setFaculty({
        name: res.data.name,
        department: res.data.department
      })

      setAcademicYear(res.data.academic_year)
      setFeedbacks(res.data.feedbacks || [])

    } catch (err) {
      console.error(err)
      alert('Failed to load faculty performance')
    }
  }

  // ---------------- PDF DOWNLOAD ----------------
  const downloadPdf = () => {
    if (!faculty.name || feedbacks.length === 0) {
      alert('No data to generate PDF!')
      return
    }

    const doc = new jsPDF()

    doc.setFontSize(16)
    doc.text('Faculty Performance Report', 14, 20)

    doc.setFontSize(11)
    doc.text(`Faculty: ${faculty.name}`, 14, 30)
    doc.text(`Department: ${faculty.department}`, 14, 38)
    doc.text(`Academic Year: ${academicYear}`, 14, 46)
    doc.text(`Course: ${course}`, 14, 54)
    doc.text(`Semester: ${semester}`, 14, 62)
    doc.text(
      `Section: ${section === 'NULL' ? 'No Section' : section || 'All'}`,
      14,
      70
    )
    doc.text(`Total Feedbacks: ${feedbacks.length}`, 14, 78)

    const tableColumns = [
      'Student',
      'Hall Ticket',
      'Type',
      'Section',
      'Ratings',
      'Comments'
    ]

    const tableRows = []

    feedbacks.forEach(f => {
      let ratingsObj = {}
      try {
        ratingsObj =
          typeof f.ratings === 'string'
            ? JSON.parse(f.ratings)
            : f.ratings
      } catch {
        ratingsObj = {}
      }

      const ratingsText = Object.entries(ratingsObj)
        .map(([q, val]) => `${q}: ${val}`)
        .join(', ')

      tableRows.push([
        f.student_name || '-',
        f.hall_ticket || '-',
        f.feedback_type || '-',
        f.section || 'No Section',
        ratingsText,
        f.comments || '-'
      ])
    })

    doc.autoTable({
      startY: 85,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [11, 60, 93], textColor: 255 },
      styles: { fontSize: 9 }
    })

    doc.save(`${faculty.name}_Performance.pdf`)
  }

  return (
    <Box sx={{ p: 4 }}>

      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: 'bold', color: '#0B3C5D' }}
        >
          {faculty.name || 'Faculty'} - Performance Details
        </Typography>

        <Box>
          <Button
            variant="contained"
            sx={{ mr: 2, backgroundColor: '#0B3C5D' }}
            onClick={downloadPdf}
          >
            Download PDF
          </Button>

          <Button
            variant="outlined"
            onClick={() => navigate('/admin/analytics')}
          >
            Back
          </Button>
        </Box>
      </Box>

      {/* INFO */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography>Department: {faculty.department || '-'}</Typography>
        <Typography>Academic Year: {academicYear || '-'}</Typography>
        <Typography>Course: {course}</Typography>
        <Typography>Semester: {semester}</Typography>
        <Typography>
          Section: {section === 'NULL' ? 'No Section' : section || 'All'}
        </Typography>
        <Typography>Total Feedbacks: {feedbacks.length}</Typography>
      </Paper>

      {/* TABLE */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead sx={{ backgroundColor: '#0B3C5D' }}>
            <TableRow>
              <TableCell sx={{ color: '#fff' }}>Student</TableCell>
              <TableCell sx={{ color: '#fff' }}>Hall Ticket</TableCell>
              <TableCell sx={{ color: '#fff' }}>Type</TableCell>
              <TableCell sx={{ color: '#fff' }}>Section</TableCell>
              <TableCell sx={{ color: '#fff' }}>Ratings</TableCell>
              <TableCell sx={{ color: '#fff' }}>Comments</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {feedbacks.map((f, idx) => {
              let ratingsObj = {}
              try {
                ratingsObj =
                  typeof f.ratings === 'string'
                    ? JSON.parse(f.ratings)
                    : f.ratings
              } catch {
                ratingsObj = {}
              }

              return (
                <TableRow key={idx}>
                  <TableCell>{f.student_name || '-'}</TableCell>
                  <TableCell>{f.hall_ticket || '-'}</TableCell>
                  <TableCell>{f.feedback_type}</TableCell>
                  <TableCell>{f.section || 'No Section'}</TableCell>

                  <TableCell>
                    {Object.entries(ratingsObj).map(([q, val]) => (
                      <Typography key={q} variant="body2">
                        {q}: {val}
                      </Typography>
                    ))}
                  </TableCell>

                  <TableCell>{f.comments || '-'}</TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  )
}