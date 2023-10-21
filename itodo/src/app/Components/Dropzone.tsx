import { useCallback, ReactNode, useState } from 'react'
import { Button, Row } from 'react-bootstrap'
import {
  useDropzone,
  FileWithPath,
  FileRejection,
  DropEvent

} from 'react-dropzone'

interface MiComponenteProps {
  children?: ReactNode;
  onDrop?: (
    file?: FileWithPath,
    fileRejections?: FileRejection[],
    event?: DropEvent
  ) => void;
  fileDefault?: FileWithPath;

}

function MyDropzone ({ onDrop, children, fileDefault }: MiComponenteProps) {
  const [file, setFile] = useState<FileWithPath | null>(null)

  const HandleDrop = useCallback(
    (
      acceptedFiles: FileWithPath[],
      fileRejections: FileRejection[],
      event: DropEvent
    ) => {
      if (acceptedFiles && acceptedFiles[0]) {
        console.log(acceptedFiles[0])
        setFile(acceptedFiles[0])
        if (onDrop) {
          onDrop(acceptedFiles[0], fileRejections, event)
        }
      }
    },
    [onDrop]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: HandleDrop
  })

  const handleRemoveFile = () => {
    setFile(null)
  }

  const getIcon = (name: string) => {
    const type = name.split('.').pop()!
    console.log(type)
    switch (type) {
      case 'pdf':
        return 'pdf'
      case 'doc':
      case 'docx':
        return 'word'
      case 'xls':
      case 'xlsx':
        return 'excel'
      case 'ppt':
      case 'pptx':
        return 'powerpoint'
      case 'jpg':
      case 'jpeg':
      case 'svg':
      case 'png':
      case 'gif':
        return 'image'
      case 'mp3':
      case 'wav':
      case 'ogg':
        return 'audio'
      case 'mp4':
      case 'mov':
      case 'avi':
        return 'video'
      case 'zip':
      case 'rar':
      case '7z':
        return 'archive'
      case 'txt':
        return 'text'
      default:
        return 'lines'
    }
  }

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />

      <div className="dropzone relative">
        {!children
          ? (
              file
                ? (
            <>
            <i onClick={handleRemoveFile} className="absolute top-1 left-1 fas m-2 fs-5 text-danger fa-times"></i>
            <Row className="justify-content-center text-center align-items-between dropDefault overflow-hidden">
              <i className={`fas mb-2 fs-4 text-primary text-center m-auto fa-file-${getIcon(file.name)}` }></i>
              <p className="text-center overflow-auto">
                {file.name}
              </p>
            </Row>
            </>
                  )
                : (
            <Row className="justify-content-center text-center align-items-between dropDefault">
              <i className="fas mb-2 fs-4 text-center m-auto fa-paperclip"></i>
              <p className="text-center">
                Arrastra o haz clic para agregar archivos.
              </p>
            </Row>
                  )
            )
          : (
              children
            )}
      </div>
    </div>
  )
}

export default MyDropzone
