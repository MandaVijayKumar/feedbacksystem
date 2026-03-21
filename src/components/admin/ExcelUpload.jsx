import {
  Box,
  Typography,
  Paper,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Divider
} from '@mui/material'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import * as XLSX from 'xlsx'
import api from '../../api/api'

export default function ExcelUpload() {
  const [file, setFile] = useState(null)
  const [uploadType, setUploadType] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: '', text: '' })
  const [previewData, setPreviewData] = useState([])
  const [columns, setColumns] = useState([])
  const [result, setResult] = useState(null)

  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('adminToken')
    if (!token) navigate('/admin')
  }, [navigate])

  // 📌 Handle File + Preview
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]

    console.log("📂 Selected File:", selectedFile)

    setFile(selectedFile)
    setMessage({ type: '', text: '' })
    setResult(null)

    if (!selectedFile) return

    const reader = new FileReader()

    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target.result)
      const workbook = XLSX.read(data, { type: 'array' })

      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      const jsonData = XLSX.utils.sheet_to_json(worksheet)

      setPreviewData(jsonData.slice(0, 5))
      if (jsonData.length > 0) {
        setColumns(Object.keys(jsonData[0]))
      }
    }

    reader.readAsArrayBuffer(selectedFile)
  }

  // 📌 Upload API (FINAL FIX)
  const handleUpload = async () => {
    if (!file || !uploadType) {
      setMessage({ type: 'error', text: 'Please select upload type and file' })
      return
    }

    console.log("🚀 Uploading file:", file)

    const formData = new FormData()
    formData.append('file', file)

    try {
      setLoading(true)
      setMessage({ type: '', text: '' })

      const res = await api.post(
        `/admin/upload/${uploadType}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('adminToken')}`,
            'Content-Type': undefined // 🔥 FORCE BROWSER TO SET MULTIPART
          },
          transformRequest: (data) => data // 🔥 PREVENT AXIOS FROM STRINGIFYING
        }
      )

      console.log("✅ RESPONSE:", res.data)

      setResult(res.data)
      setMessage({ type: 'success', text: res.data.msg })

    } catch (err) {
      console.error("❌ ERROR:", err)

      setMessage({
        type: 'error',
        text: err.response?.data?.msg || 'Upload failed'
      })
    } finally {
      setLoading(false)
    }
  }

  const getInstructions = () => {
    switch (uploadType) {
      case 'students':
        return 'Columns: hall_ticket, name, course, department, semester, section (A/B/C/D or empty), phone, email, academic_year'
      case 'subjects':
        return 'Columns: subject_id, subject_name, course, semester, section (A/B/C/D or empty), faculty_id'
      case 'faculty':
        return 'Columns: faculty_id, name, department, designation'
      default:
        return ''
    }
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
      <Paper elevation={4} sx={{ p: 4, width: 700 }}>
        <Typography variant="h6">Upload Excel Data</Typography>

        {/* Upload Type */}
        <FormControl fullWidth margin="normal">
          <InputLabel>Upload Type</InputLabel>
          <Select
            value={uploadType}
            label="Upload Type"
            onChange={(e) => {
              setUploadType(e.target.value)
              setFile(null)
              setPreviewData([])
              setColumns([])
              setResult(null)
            }}
          >
            <MenuItem value="students">Students</MenuItem>
            <MenuItem value="faculty">Faculty</MenuItem>
            <MenuItem value="subjects">Subjects</MenuItem>
          </Select>
        </FormControl>

        {/* Instructions */}
        {uploadType && (
          <Alert severity="info" sx={{ mt: 2 }}>
            {getInstructions()}
          </Alert>
        )}

        {/* File Upload */}
        <Button variant="outlined" component="label" fullWidth sx={{ mt: 2 }}>
          Choose Excel File
          <input
            type="file"
            hidden
            accept=".xlsx, .xls"
            onChange={handleFileChange}
          />
        </Button>

        {file && (
          <Typography sx={{ mt: 1 }}>File: {file.name}</Typography>
        )}

        {/* Preview */}
        {previewData.length > 0 && (
          <>
            <Typography sx={{ mt: 3, fontWeight: 'bold' }}>
              Preview (First 5 Rows)
            </Typography>

            <Table size="small" sx={{ mt: 1 }}>
              <TableHead>
                <TableRow>
                  {columns.map((col) => (
                    <TableCell key={col}>{col}</TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {previewData.map((row, i) => (
                  <TableRow key={i}>
                    {columns.map((col) => (
                      <TableCell key={col}>
                        {row[col] ?? '-'}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </>
        )}

        {/* Upload Button */}
        <Button
          variant="contained"
          fullWidth
          sx={{ mt: 3, backgroundColor: '#0B3C5D' }}
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? 'Uploading...' : 'Upload'}
        </Button>

        {/* Message */}
        {message.text && (
          <Alert severity={message.type} sx={{ mt: 2 }}>
            {message.text}
          </Alert>
        )}

        {/* Result */}
       {result && (
  <Box sx={{ mt: 4 }}>
    <Divider sx={{ mb: 2 }} />

    <Typography variant="h6">Upload Summary</Typography>

    <Alert severity="info" sx={{ mt: 1 }}>
      Total: {result.successCount + result.failedCount} | 
      Success: {result.successCount} | 
      Failed: {result.failedCount}
    </Alert>

    {/* ✅ SUCCESS TABLE */}
    {result.success.length > 0 && (
      <>
        <Typography sx={{ mt: 3, color: 'green', fontWeight: 'bold' }}>
          Successful Rows
        </Typography>

        <Table size="small" sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell>Row</TableCell>
              <TableCell>ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.success.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.row}</TableCell>
                <TableCell>
                  {row.hall_ticket || row.subject_id || row.faculty_id}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    )}

    {/* ❌ FAILED TABLE */}
    {result.failed.length > 0 && (
      <>
        <Typography sx={{ mt: 3, color: 'red', fontWeight: 'bold' }}>
          Failed Rows
        </Typography>

        <Table size="small" sx={{ mt: 1 }}>
          <TableHead>
            <TableRow>
              <TableCell>Row</TableCell>
              <TableCell>ID</TableCell>
              <TableCell>Error</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {result.failed.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.row}</TableCell>
                <TableCell>
                  {row.hall_ticket || row.subject_id || row.faculty_id || '-'}
                </TableCell>
                <TableCell style={{ color: 'red', fontWeight: 'bold' }}>
                  {row.error}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </>
    )}
  </Box>
)}
      </Paper>
    </Box>
  )
}