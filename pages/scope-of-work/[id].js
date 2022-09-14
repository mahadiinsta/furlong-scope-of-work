import { useEffect, useState } from "react";
import * as React from "react";
import {
  AppBar,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Toolbar,
  Typography,
} from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { convertFromRaw, convertToRaw, EditorState } from "draft-js";
import { useRouter } from "next/dist/client/router";
import dynamic from "next/dynamic";
import Image from "next/image";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import logo from "../../public/Furlong_Logo.jpg";
import CloseIcon from "@mui/icons-material/Close";
import Pdf from "react-to-pdf";
import ReactToPrint from "react-to-print";
const Editor = dynamic(
  () => import("react-draft-wysiwyg").then((mod) => mod.Editor),
  { ssr: false }
);

const ScopeOfWork = ({
  project_variations,
  initialDataFromDB,
  project_data,
}) => {
  console.log("Test ", { initialDataFromDB }, { project_variations });
  const router = useRouter();
  const projectID = router.query.id;

  let initialData = {
    blocks: [
      {
        key: "6c8fc",
        text: "Please, Enter Your Text Here....",
        type: "unstyled",
        depth: 0,
        inlineStyleRanges: [],
        entityRanges: [],
        data: {},
      },
    ],
    entityMap: {},
  };

  if (initialDataFromDB.length > 0) {
    initialData = JSON.parse(initialDataFromDB[0].content);
  }
  const [editorState, setEditorState] = useState(() =>
    EditorState.createEmpty()
  );

  const [loading, setLoading] = useState(false);

  const publishPost = async () => {
    setLoading(true);
    try {
      const data = {
        projectID: projectID,
        content: JSON.stringify(convertedContent),
      };
      const response = await axios.post("/api/scopeofwork/scope-of-work", data);
    } catch (error) {
      console.log(error);
    }
    router.reload(window.location.pathname);
  };

  const updatePost = async () => {
    setLoading(true);
    try {
      const data = {
        projectID: projectID,
        content: JSON.stringify(convertedContent),
      };

      const response = await axios.put("/api/scopeofwork/scope-of-work", data);
    } catch (error) {
      console.log(error);
    }
    router.reload(window.location.pathname);
  };
  const [convertedContent, setConvertedContent] = useState(null);

  const [state, setState] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const ref = React.useRef(null)

  const onEditorStateChange = (editorState) => {
    setEditorState(editorState);
    setConvertedContent(convertToRaw(editorState.getCurrentContent()));
  };

  useEffect(() => {
    setEditorState(EditorState.createWithContent(convertFromRaw(initialData)));
  }, []);


  const reactToPrintContent = React.useCallback(() => {
    return ref.current;
  }, [ref.current]);

  const reactToPrintTrigger = React.useCallback(() => {
    // NOTE: could just as easily return <SomeComponent />. Do NOT pass an `onClick` prop
    // to the root node of the returned component as it will be overwritten.

    // Bad: the `onClick` here will be overwritten by `react-to-print`
    // return <button onClick={() => alert('This will not work')}>Print this out!</button>;

    // Good
    return <button>Print using a Functional Component</button>;
  }, []);

  return (
    <>
      {loading === false ? (
        <Box sx={{ width: "80%", margin: "0 auto" }}>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Image src={logo} alt="bg" width={200} height={200} />
          </Box>
          <Typography
            variant="h6"
            align="center"
            sx={{ fontWeight: "bold", m: "20px 0px" }}
          >
            {project_data[0].Name || "Scope of Work"}
          </Typography>
          <Box
            sx={{
              minHeight: 400,
              mb: 1,
            }}
          >
            <Box sx={{ border: "1px solid lightgrey", padding: 1 }}>
              <Editor
                editorState={editorState}
                onEditorStateChange={onEditorStateChange}
                wrapperClassName="wrapper-class"
                editorClassName="editor-class"
                toolbarClassName="toolbar-class"
              />
            </Box>

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
                sx={{ display: "flex", justifyContent: "center", mt: 5, mb: 1 }}
              >
                <Button
                  onClick={() => setDialogOpen(true)}
                  variant="contained"
                  sx={{ minWidth: 300, margin: "0 auto" }}
                >
                  generate pdf
                </Button>
              </Box>
            ) : (
              ""
            )}
          </Box>
          {project_variations?.length ? (
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table sx={{ minWidth: 650 }} aria-label="simple table">
                <TableHead sx={{ bgcolor: "#000", color: "#fff" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold", color: "#fff" }}>
                      Variation Name
                    </TableCell>
                    <TableCell
                      align="left"
                      sx={{ fontWeight: "bold", color: "#fff" }}
                    >
                      Variation Summary
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {project_variations.map((item, index) => (
                    <TableRow
                      key={index}
                      sx={{
                        "&:last-child td, &:last-child th": { border: 0 },
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
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Typography variant="h3">No Project Variations</Typography>
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ display: "flex", justifyContent: "center", mt: "20%" }}>
          <CircularProgress size={40} />
        </Box>
      )}
      <Dialog
        fullScreen
        open={dialogOpen}
        // onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <AppBar sx={{ position: "relative" }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => setDialogOpen(false)}
              aria-label="close"
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Sound
            </Typography>
            <Pdf targetRef={ref} filename="code-example.pdf" bodyClass={"printElement1"}>
              {({ toPdf }) => <button onClick={toPdf}>Generate Pdf</button>}
            </Pdf>
            <Button
              onClick={publishPost}
              variant="contained"
              // sx={{ mt: 4, minWidth: 200 }}
            >
              Submit
            </Button>
          </Toolbar>
        </AppBar>
        <ReactToPrint
        content={reactToPrintContent}
        documentTitle="AwesomeFileName"
        // onAfterPrint={handleAfterPrint}
        // onBeforeGetContent={handleOnBeforeGetContent}
        // onBeforePrint={handleBeforePrint}
        // removeAfterPrint
        trigger={reactToPrintTrigger}
      />
        <Box
          className="printElement1"
          sx={{ m: 4, p: 4}}
          ref={ref}
        >
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Image src={logo} alt="bg" width={100} height={100} />
          </Box>
          <Typography
            color="primary"
            variant="h5"
            align="center"
            sx={{ pt: 3 }}
          >
            PROJECT SHEET - OFFICE{" "}
          </Typography>
          <Box sx={{ p: "20px 0px" }}>
            <p>
              <b>PROJECT NAME:</b> {project_data[0]?.Name}
            </p>
            <p>
              <b>Sale Date:</b> {project_data[0]?.Es}
            </p>
            <p>
              <b>SALESPERSON:</b> {project_data[0].Salesperson?.name}
            </p>
            <p>
              <b>EST TIME (BUDGET):</b> {project_data[0]?.Budget_hours}
            </p>
            <p>
              <b>EST TIME (AllOW) :</b> {project_data[0]?.Painter_Estimate}
            </p>
            <p>
              <b>PROJECT TIMING:</b> {project_data[0]?.Project_Timing}
            </p>
            <p>
              <b>CONTACT NAME:</b> {project_data[0]?.Site_name}
            </p>
            <p>
              <b>ACCOUNT ADDRESS:</b> {project_data[0]?.Account_address}
            </p>
            {/* <p><b>SALESPERSON:</b> {project_data[0]?.Salesperson	}</p> */}
            <p>
              <b>CONTACT PHONE:</b> {project_data[0]?.Client_phone}
            </p>
            <p>
              <b>CONTACT EMAIL:</b> {project_data[0]?.Client_email}
            </p>
            <p>
              <b>SITE NAME :</b> {project_data[0]?.Site_Name3}
            </p>
            <p>
              <b>SITE ADDRESS:</b> {project_data[0]?.Site_address}
            </p>
            <p>
              <b>SITE CONTACT NAME:</b> {project_data[0]?.Site_name}
            </p>
            <p>
              <b>SITE CONTACT NO:</b>{" "}
              {project_data[0]?.Site_contact_phone_number}
            </p>
            <p>
              <b>SITE CONTACT EMAIL:</b> {project_data[0]?.Site_Contact_Email}
            </p>
            <p>
              <b>
                <u>SCOPE OF WORK</u>
              </b>
            </p>
            <Box sx={{ borderTop: "1px solid lightgrey", p: 1 }}>
              <Editor
                toolbarHidden
                editorState={editorState}
                wrapperClassName="wrapper-class"
                editorClassName="editor-class"
                toolbarClassName="toolbar-class"
              />
            </Box>
          </Box>
        </Box>
      </Dialog>
    </>
  );
};

export default ScopeOfWork;

export async function getServerSideProps(context) {
  const id = context.params.id;
  const accessToken = await axios.get(process.env.ACCESSTOKEN_URL);

  const project_resp = await axios.get(
    `https://www.zohoapis.com/crm/v2/FP_Projects/${id}`,
    {
      headers: {
        Authorization: accessToken.data.access_token,
      },
    }
  );

  const project_variations_resp = await axios.get(
    `https://www.zohoapis.com/crm/v2/FP_Projects/${id}/Project_Variation`,
    {
      headers: {
        Authorization: accessToken.data.access_token,
      },
    }
  );
  // console.log({ resp: project_variations_resp?.data?.data || ['NoData'] })

  const getInitialDataResp = await axios.get(
    `https://furlong-scope-of-work.vercel.app/api/scopeofwork/scope-of-work?id=${id}`
  );
  return {
    props: {
      project_variations: project_variations_resp?.data?.data || [],
      initialDataFromDB: getInitialDataResp?.data?.message || [],
      project_data: project_resp?.data?.data || [],
    },
  };
}
