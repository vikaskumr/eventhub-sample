import { Typography, Button, Theme, Grid } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import { useState, useEffect } from 'react'
import { Info } from '@material-ui/icons'
import swal from 'sweetalert'


type UploadProps = {
  onUpload: (file: File,) => void
}

export default function Upload({ onUpload }: UploadProps) {

  const classes = useStyles()


  const [file, setFile] = useState<File>()
  const [fileName, setFileName] = useState('')

  const uploadToClient = (event) => {
    console.log('event', event)

    if (event.target.files && event.target.files[0]) {

      setFileName(event.target.files[0].name)
      setFile(event.target.files[0])
      event.target.value = null
    }
  }

  return (
    <section className={classes.upload}>
      <div className={classes.uploadHeader}>
        <Info />
      </div>

      <div className={classes.form}>
        <Grid container>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={7} md={9}>
              <div className={classes.formGroup}>
                <Typography variant="caption">FILE</Typography>
                <input placeholder={fileName ? fileName : 'No file chosen'} />
              </div>
            </Grid>
            <Grid item xs={12} sm={5} md={3}>
              <Button variant="outlined" color="secondary" fullWidth className={classes.fileButton} component="label">
                Browse
                <input type="file" hidden accept=".txt, .xml, .csv, .json" onClick={uploadToClient} />
              </Button>
            </Grid>
            <Grid item xs={6} sm={5}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                onClick={() => {
                  if (!file) {
                    return swal('Error', 'No file uploaded', 'error')
                  }
                  onUpload(file)
                }}
              >
                Upload
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </div>
    </section>
  )
}

const useStyles = makeStyles((theme: Theme) => ({
  upload: {
    border: '1px solid #fff',
    padding: theme.spacing(6),
    margin: theme.spacing(3, 1)
  },
  uploadHeader: {
    textAlign: 'right',
    color: '#fff'
  },
  form: {
    marginTop: '1rem',

    '& button': {
      padding: '.7rem',
      marginBottom: '1rem'
    }
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginBottom: '2rem',

    '& span': {
      fontSize: '.8rem',
      marginBottom: '.3rem'
    },
    '& *': {
      color: '#fff'
    },
    '& input': {
      width: '100%'
    }
  },
  errorText: {
    color: theme.palette.error.main
  },
  fileButton: {
    marginTop: theme.spacing(3),
    padding: '.5rem'
  }
}))
