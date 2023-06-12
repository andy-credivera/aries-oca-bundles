import React from "react";
import { FileUpload } from "@mui/icons-material";
import { Box, TextField, Button, Snackbar, Alert } from "@mui/material";
import { useState, ReactNode } from "react";

// The upper limit required to base64 encode a 1920x1080 PNG image based on testing.
// Users should be necouraged to avoid PNGs if possible due to the added file size
const MAX_IMAGE_SIZE = 1000000;

enum FileStatus {
  NoFile,
  ValidFile,
  InvalidImage,
  FileTooLarge,
}

type FileState = { status: FileStatus; value: string };

export default function ImageField({
  id,
  label,
  value,
  onContent,
}: {
  id?: string;
  label: string;
  value: string;
  onContent: (e: any) => void;
}) {
  const [file, setFile] = useState<FileState>({
    status: FileStatus.NoFile,
    value: value,
  });
  const isError = (f: FileState) =>
    f.status != FileStatus.ValidFile && f.status != FileStatus.NoFile;

  const handleImageChange = (event: any) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const imageDataURL: string = e.target.result;
      // Image validation
      const image = new Image();

      // If invalid warn the user and do not update field
      image.onerror = () =>
        setFile({ status: FileStatus.InvalidImage, value: imageDataURL });

      // If valid image update text field with this data url
      image.onload = () => {
        if (imageDataURL.length < MAX_IMAGE_SIZE) {
          setFile({ status: FileStatus.ValidFile, value: imageDataURL });
          onContent(imageDataURL);
        } else {
          setFile({ status: FileStatus.FileTooLarge, value: imageDataURL });
        }
      };

      image.src = imageDataURL;
    };

    reader.readAsDataURL(file);
  };

  // Used for generating a simple overridable error message
  const errorMessage = (msg: ReactNode) => (
    <Alert
      action={
        <Button
          onClick={() => {
            setFile({
              ...file,
              status: FileStatus.ValidFile,
            });
            onContent(file.value);
          }}
        >
          Proceed Anyways
        </Button>
      }
      severity="error"
    >
      {msg}
    </Alert>
  );

  return (
    <div>
      <Box sx={{ display: "flex" }}>
        <TextField
          fullWidth
          margin="dense"
          size="small"
          id={id}
          error={isError(file)}
          value={isError(file) ? "" : value}
          label={label + " (" + value.length + " characters long" + ")"}
          onChange={(event) => {
            setFile({ status: FileStatus.NoFile, value: event.target.value });
            onContent(event.target.value);
          }}
        />
        <Button variant="text" component="label" size="small" disableElevation>
          <FileUpload />
          <input
            hidden
            type="file"
            id="myfile"
            name="myfile"
            onChange={(e) => {
              handleImageChange(e);
            }}
          />
        </Button>
      </Box>
      <Snackbar autoHideDuration={6000} open={isError(file)}>
        {file.status == FileStatus.InvalidImage
          ? errorMessage(
              <>
                ERROR: This file does not seem to be a valid image. Are you sure
                you want to use this file?
              </>
            )
          : file.status == FileStatus.FileTooLarge
          ? errorMessage(
              <>
                ERROR: We recommend not using an image larger than{" "}
                {MAX_IMAGE_SIZE} characters after encoding. Are you sure you
                want to use this file?
              </>
            )
          : undefined}
      </Snackbar>
    </div>
  );
}
