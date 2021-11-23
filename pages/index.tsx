import Head from 'next/head'

import utilStyles from '../styles/utils.module.css'
import { getSortedPostsData } from '../lib/posts'
import { Typography, Button, Theme, Grid, Container } from '@material-ui/core'
import Link from 'next/link'
import Date from '../components/date'
import { GetStaticProps } from 'next'
import { makeStyles } from '@material-ui/core/styles'
import React, { useState, useEffect } from 'react'
import { Info } from '@material-ui/icons'
import swal from 'sweetalert'
import { UploadContainer } from '../components/UploadFile/UploadContainer'

export default function Home({
  allPostsData
}: {
  allPostsData: {
    date: string
    title: string
    id: string
  }[]
}) {


  const classes = useStyles()
  return (

    <div>
      <Head>
        <title>EW-DSB Client Gateway - File Upload / Download</title>
        <meta name="description" content="EW-DSB Client Gateway" />
      </Head>
      <main>
        <Container maxWidth="lg">
          <section className={classes.main}>
            <Typography className={classes.textWhite} variant="h4">
              File Upload{' '}
            </Typography>
            <UploadContainer />
          </section>
        </Container>
      </main>
    </div>

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
  },
  divider: {
    background: '#fff',
    margin: '3rem 0'
  },
  main: {
    padding: '0 2rem'
  },
  textWhite: {
    color: '#fff'
  }
}))


export const getStaticProps: GetStaticProps = async () => {
  const allPostsData = getSortedPostsData()
  return {
    props: {
      allPostsData
    }
  }
}