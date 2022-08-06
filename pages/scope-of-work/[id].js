import { useEffect, useState } from 'react'

import {
  Button,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import axios from 'axios'
import { convertFromRaw, convertToRaw, EditorState } from 'draft-js'
import { useRouter } from 'next/dist/client/router'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css'
import logo from '../../public/Furlong_Logo.jpg'
const Editor = dynamic(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false },
)

const ScopeOfWork = ({ project_variations, initialDataFromDB }) => {
  console.log('Test ', { initialDataFromDB }, { project_variations })
  const router = useRouter()
  const projectID = router.query.id

  let initialData = {
    blocks: [
      {
        key: '6c8fc',
        text: 'Please, Enter Your Text Here....',
        type: 'unstyled',
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
    ],
    entityMap: {},
  }

  if (initialDataFromDB.length > 0) {
    initialData = JSON.parse(initialDataFromDB[0].content)
  }
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty(),
  )

  const [loading, setLoading] = useState(false)

  const publishPost = async () => {
    setLoading(true)
    try {
      const data = {
        projectID: projectID,
        content: JSON.stringify(convertedContent),
      }

      const response = await axios.post('/api/scopeofwork/scope-of-work', data)
    } catch (error) {
      console.log(error)
    }
    router.reload(window.location.pathname)
  }

  const updatePost = async () => {
    setLoading(true)
    try {
      const data = {
        projectID: projectID,
        content: JSON.stringify(convertedContent),
      }

      const response = await axios.put('/api/scopeofwork/scope-of-work', data)
    } catch (error) {
      console.log(error)
    }
    router.reload(window.location.pathname)
  }
  const [convertedContent, setConvertedContent] = useState(null)

  const [state, setState] = useState([])

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState)
    setConvertedContent(convertToRaw(editorState.getCurrentContent()))
  }

  useEffect(() => {
    setEditorState(EditorState.createWithContent(convertFromRaw(initialData)))
  }, [])

  return (
    <>
      {loading === false ? (
        <Box sx={{ width: '80%', margin: '0 auto' }}>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Image src={logo} alt="bg" width={250} height={250} />
          </Box>
          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 'bold', m: '20px 0px' }}
          >
            Scope of Work
          </Typography>
          <Box sx={{ minHeight: 400, mb: 1, border: '1px solid lightgrey' }}>
            <Editor
              editorState={editorState}
              onEditorStateChange={onEditorStateChange}
              wrapperClassName="wrapper-class"
              editorClassName="editor-class"
              toolbarClassName="toolbar-class"
            />

            {initialDataFromDB.length === 0 ? (
              <Button
                onClick={publishPost}
                variant="contained"
                sx={{ mt: 4, minWidth: 200 }}
              >
                Submit
              </Button>
            ) : initialDataFromDB.length > 0 && convertedContent !== null ? (
              <Box
                sx={{ display: 'flex', justifyContent: 'center', mt: 5, mb: 1 }}
              >
                <Button
                  onClick={updatePost}
                  variant="contained"
                  sx={{ minWidth: 300, margin: '0 auto' }}
                >
                  Update
                </Button>
              </Box>
            ) : (
              ''
            )}
          </Box>
          {project_variations?.length ? (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead sx={{ bgcolor: '#000', color: '#fff' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', color: '#fff' }}>
                      Variation Name
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: 'bold', color: '#fff' }}
                    >
                      Variation Summury
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {project_variations.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      <TableCell component="th" scope="row">
                        {item.Name}
                      </TableCell>
                      <TableCell>{item.Variation_to_Scope_of_Work}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h3">No Project Variations</Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: '20%' }}>
          <CircularProgress size={40} />
        </Box>
      )}
    </>
  )
}

export default ScopeOfWork

export async function getServerSideProps(context) {
  const id = context.params.id
  const accessToken = await axios.get(process.env.ACCESSTOKEN_URL)

  const project_variations_resp = await axios.get(
    `https://www.zohoapis.com/crm/v2/FP_Projects/${id}/Project_Variation`,
    {
      headers: {
        Authorization: accessToken.data.access_token,
      },
    },
  )
  // console.log({ resp: project_variations_resp?.data?.data || ['NoData'] })

  const getInitialDataResp = await axios.get(
    `https://furlong-scope-of-work.vercel.app//api/scopeofwork/scope-of-work?id=${id}`,
  )
  return {
    props: {
      project_variations: project_variations_resp?.data?.data || [],
      initialDataFromDB: getInitialDataResp?.data?.message || [],
    },
  }
}
