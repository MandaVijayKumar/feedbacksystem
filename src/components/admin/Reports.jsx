import {
  Box, Typography, Paper, Table, TableBody, TableCell,
  TableHead, TableRow, TextField, LinearProgress,
  Chip, Button, Grid, Divider
} from '@mui/material'
import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/api'

import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function FacultyReportsAdvanced() {

  const [reports, setReports] = useState([])
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const pdfRef = useRef()

  useEffect(() => { fetchReports() }, [])

  const fetchReports = async () => {
    const res = await api.get('/admin/reports/faculty-advanced')
    setReports(res.data)
  }

  const filtered = reports.filter(r =>
    r.name?.toLowerCase().includes(search.toLowerCase())
  )

  const getPercentage = (avg) => ((avg / 5) * 100).toFixed(0)

  const getPerformanceLabel = (p) => {
    if (p >= 80) return 'Excellent'
    if (p >= 60) return 'Good'
    return 'Needs Improvement'
  }

  const getPerformanceColor = (p) => {
    if (p >= 80) return 'success'
    if (p >= 60) return 'warning'
    return 'error'
  }

  const getFeedbackType = (subjects = []) => {
    let t = false, l = false
    subjects.forEach(s => {
      if (s.theoryAvg) t = true
      if (s.labAvg) l = true
    })
    if (t && l) return 'THEORY + LAB'
    if (t) return 'THEORY'
    if (l) return 'LAB'
    return '-'
  }

  // KPI
  const totalFaculty = filtered.length
  const totalResponses = filtered.reduce((sum, r) => sum + r.responses, 0)
  const avgScore = filtered.length
    ? (filtered.reduce((sum, r) => sum + Number(r.overallAvg), 0) / filtered.length).toFixed(2)
    : 0

  const handleDownloadPDF = async () => {
    const input = pdfRef.current
    if (!input) return

    const pdf = new jsPDF('p', 'mm', 'a4')

    try {
      // 🖼️ LOAD LOGO
      const img = new Image()
      img.src = '/logo.jpg'

      await new Promise((resolve, reject) => {
        img.onload = resolve
        img.onerror = reject
      })

      // 📄 PAGE WIDTH
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      // 🖼️ LOGO CENTER
      const logoWidth = 20
      const logoX = (pageWidth - logoWidth) / 2

      pdf.addImage(img, 'PNG', logoX, 8, logoWidth, 20)

      // 🏫 UNIVERSITY NAME
      pdf.setFontSize(16)
      pdf.text('Rayalaseema University', pageWidth / 2, 32, { align: 'center' })

      // 📑 REPORT TITLE
      pdf.setFontSize(12)
      pdf.text('Faculty Performance Report', pageWidth / 2, 38, { align: 'center' })

      // 📅 DATE
      pdf.setFontSize(9)
      pdf.text(
        `Generated on: ${new Date().toLocaleDateString()}`,
        pageWidth / 2,
        44,
        { align: 'center' }
      )

      // 🔵 HEADER LINE
      pdf.setDrawColor(11, 60, 93)
      pdf.setLineWidth(0.5)
      pdf.line(10, 48, pageWidth - 10, 48)

      // 📸 CAPTURE UI
      const canvas = await html2canvas(input, {
        scale: 2,
        useCORS: true
      })

      const imgData = canvas.toDataURL('image/png')

      const imgWidth = 190
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 52 // start below header

      // FIRST PAGE
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight)
      heightLeft -= (pageHeight - position)

      // 🔁 MULTI PAGE SUPPORT
      while (heightLeft > 0) {
        pdf.addPage()

        pdf.addImage(
          imgData,
          'PNG',
          10,
          position - (imgHeight - heightLeft),
          imgWidth,
          imgHeight
        )

        heightLeft -= pageHeight
      }

      // 📄 SAVE
      pdf.save('Faculty_Performance_Report.pdf')

    } catch (err) {
      console.error(err)
      alert('PDF generation failed (check logo path)')
    }
  }
  return (
    <Box sx={{ p: 4 }}>

      {/* HEADER */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#0B3C5D' }}>
          Faculty Performance Analytics
        </Typography>

        <Box>
          <Button variant="contained" sx={{ mr: 2, background: '#0B3C5D' }} onClick={handleDownloadPDF}>
            Download PDF
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            Back
          </Button>
        </Box>
      </Box>

      {/* PDF CONTENT */}
      <Box ref={pdfRef}>

        {/* KPI */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2">Total Faculty</Typography>
              <Typography variant="h6">{totalFaculty}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2">Total Responses</Typography>
              <Typography variant="h6">{totalResponses}</Typography>
            </Paper>
          </Grid>

          <Grid item xs={4}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="body2">Average Score</Typography>
              <Typography variant="h6">{avgScore} / 5</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* SEARCH */}
        <TextField
          fullWidth
          label="Search Faculty"
          sx={{ mb: 3 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* TABLE */}
        <Paper elevation={4}>
          <Table>

            <TableHead sx={{ background: '#0B3C5D' }}>
              <TableRow>
                <TableCell sx={{ color: '#fff' }}>Faculty</TableCell>
                <TableCell sx={{ color: '#fff' }}>Course</TableCell>
                <TableCell sx={{ color: '#fff' }}>Semester</TableCell>
                <TableCell sx={{ color: '#fff' }}>Year</TableCell>
                <TableCell sx={{ color: '#fff' }}>Type</TableCell>
                <TableCell sx={{ color: '#fff' }}>Subject Analysis</TableCell>
                <TableCell sx={{ color: '#fff' }}>Responses</TableCell>
                <TableCell sx={{ color: '#fff' }}>Performance</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {filtered.map((r, idx) => {

                const percent = getPercentage(r.overallAvg)

                return (
                  <TableRow key={idx} hover>

                    {/* FACULTY */}
                    <TableCell>
                      <Typography fontWeight="bold" sx={{ color: '#0B3C5D' }}>
                        {r.name}
                      </Typography>

                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Department: <b>{r.department}</b>
                      </Typography>

                      {/* ✅ Show only valid sections */}
                      {r.section &&
                        r.section !== 'NULL' &&
                        r.section !== 'No Section' &&
                        r.section.trim() !== '' && (
                          <Typography variant="body2">
                            Section: <b>{r.section}</b>
                          </Typography>
                        )}
                    </TableCell>

                    <TableCell>{r.course}</TableCell>
                    <TableCell>{r.semester}</TableCell>
                    <TableCell>{r.academic_year}</TableCell>

                    <TableCell>
                      <Chip label={getFeedbackType(r.subjects)} size="small" />
                    </TableCell>

                    {/* SUBJECT ANALYSIS */}
                    <TableCell>
                      {r.subjects.map((s, i) => (
                        <Box key={i} sx={{ mb: 1 }}>
                          <Typography fontWeight="bold" variant="caption">
                            {s.subject_name}
                          </Typography>

                          {s.theoryAvg && (
                            <Box>
                              <Typography variant="caption" display="block">
                                Theory: {s.theoryAvg} ({getPercentage(s.theoryAvg)}%)
                                {' '}| Responses: <b>{s.theoryResponses || 0}</b>
                              </Typography>

                              <LinearProgress
                                value={getPercentage(s.theoryAvg)}
                                variant="determinate"
                                sx={{ height: 6, borderRadius: 5, mb: 0.5 }}
                              />
                            </Box>
                          )}

                          {s.labAvg && (
                            <Box>
                              <Typography variant="caption" display="block">
                                Lab: {s.labAvg} ({getPercentage(s.labAvg)}%)
                                {' '}| Responses: <b>{s.labResponses || 0}</b>
                              </Typography>

                              <LinearProgress
                                color="success"
                                value={getPercentage(s.labAvg)}
                                variant="determinate"
                                sx={{ height: 6, borderRadius: 5 }}
                              />
                            </Box>
                          )}


                        </Box>
                      ))}
                    </TableCell>

                    {/* RESPONSES */}
                    <TableCell align="center">
                      <Typography fontWeight="bold">{r.responses}</Typography>
                      <Typography variant="caption">Total</Typography>
                    </TableCell>

                    {/* PERFORMANCE */}
                    <TableCell align="center">
                      <Typography fontWeight="bold">
                        {r.overallAvg} / 5 ({percent}%)
                      </Typography>

                      <LinearProgress
                        value={percent}
                        variant="determinate"
                        sx={{ height: 8, borderRadius: 5, mt: 1 }}
                      />

                      <Chip
                        label={getPerformanceLabel(percent)}
                        color={getPerformanceColor(percent)}
                        size="small"
                        sx={{ mt: 1 }}
                      />
                    </TableCell>

                  </TableRow>
                )
              })}
            </TableBody>

          </Table>
        </Paper>

      </Box>
    </Box>
  )
}