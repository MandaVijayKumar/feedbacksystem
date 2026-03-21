import { Box, Typography, Paper, Button, Grid } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import buildingImg from '../../assets/banner2.jpg'
import vcImg from '../../assets/vc.jpg'
import rectorImg from '../../assets/rector.JPG'
import registrarImg from '../../assets/Registrar.JPG'

export default function Home() {
  const navigate = useNavigate()

  const leaders = [
    { img: vcImg, name: 'Prof. V. Venkata Basava Rao', title: "Hon'ble Vice Chancellor" },
    { img: rectorImg, name: 'Prof. N.T.K. Naik', title: 'Rector' },
    { img: registrarImg, name: 'Dr. B. Vijaya Kumar Naidu', title: 'Registrar' }
  ]

  return (
    <Box>

      {/* 🔥 HERO SECTION (RESPONSIVE) */}
      <Box
        sx={{
          minHeight: { xs: 300, sm: 350, md: 450 },
          px: 2,
          backgroundImage: `url(${buildingImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          color: '#fff'
        }}
      >
        <Box
          sx={{
            bgcolor: 'rgba(0,0,0,0.4)',
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 2,
            width: { xs: '100%', sm: '90%', md: '70%' }
          }}
        >
          <Typography
            variant="h3"
            sx={{ fontSize: { xs: 20, sm: 26, md: 34 }, fontWeight: 'bold' }}
            gutterBottom
          >
            Rayalaseema University, Kurnool
          </Typography>

          <Typography
            sx={{ fontSize: { xs: 14, sm: 16, md: 18 } }}
            gutterBottom
          >
            Online Student Feedback System
          </Typography>

          <Typography sx={{ mb: 2, fontSize: { xs: 12, sm: 14, md: 16 } }}>
            Submit confidential feedback on faculty performance using secure OTP-based authentication.
          </Typography>

          <Button
            variant="contained"
            sx={{
              background: '#0B3C5D',
              fontSize: { xs: 12, sm: 14, md: 16 },
              px: { xs: 2, md: 4 }
            }}
            onClick={() => navigate('/student')}
          >
            Submit Feedback
          </Button>
        </Box>
      </Box>

      {/* 👨‍🏫 LEADERS */}
      <Box sx={{ p: { xs: 2, md: 4 }, bgcolor: '#f9f9f9' }}>
        <Grid container spacing={3} justifyContent="center">
          {leaders.map((leader, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Paper
                elevation={4}
                sx={{
                  borderRadius: 3,
                  textAlign: 'center',
                  p: 2
                }}
              >
                <img
                  src={leader.img}
                  alt={leader.name}
                  style={{
                    width: '100%',
                    height: 180,
                    objectFit: 'cover',
                    borderRadius: 8
                  }}
                />

                <Box sx={{ mt: 2 }}>
                  <Typography
                    sx={{
                      fontWeight: 'bold',
                      fontSize: { xs: 14, md: 18 },
                      color: '#0B3C5D'
                    }}
                  >
                    {leader.name}
                  </Typography>

                  <Typography variant="caption" sx={{ color: 'gray' }}>
                    {leader.title}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* 📘 INSTRUCTIONS */}
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 'bold',
              color: '#0B3C5D',
              fontSize: { xs: 18, md: 24 }
            }}
          >
            Instructions for Students
          </Typography>

          <Box sx={{ mt: 2 }}>
            {[
              "Use your official hall ticket number for OTP authentication.",
              "Select correct faculty, subject and feedback type.",
              "Answer all questions honestly.",
              "Comments are optional but helpful."
            ].map((text, i) => (
              <Typography
                key={i}
                sx={{ mb: 1, fontSize: { xs: 13, md: 15 } }}
              >
                • {text}
              </Typography>
            ))}
          </Box>

          {/* THEORY */}
          <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontWeight: 'bold', color: '#0B3C5D' }}>
              Theory Feedback
            </Typography>
            <Typography sx={{ fontSize: { xs: 13, md: 15 } }}>
              • Complete theory feedback first.
            </Typography>
          </Box>

          {/* LAB */}
          <Box sx={{ mt: 2 }}>
            <Typography sx={{ fontWeight: 'bold', color: '#0B3C5D' }}>
              Lab Feedback
            </Typography>
            <Typography sx={{ fontSize: { xs: 13, md: 15 } }}>
              • Submit only if applicable.
            </Typography>
          </Box>

        </Paper>
      </Box>

    </Box>
  )
}