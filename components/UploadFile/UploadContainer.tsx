import { useState } from 'react'
import Upload from './Upload'
import axios from 'axios'
import swal from '@sweetalert/with-react'


type UploadContainerProps = {
    auth?: string
}

export const UploadContainer = ({ auth }: UploadContainerProps) => {
    const [isLoading, setIsLoading] = useState(false)

    const handleUpload = async (file: File,) => {
        setIsLoading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await axios.post(
                `/api/upload`,
                formData,
                {
                    headers: {
                        Authorization: auth ? `Bearer ${auth}` : undefined,
                        'content-type': 'multipart/form-data'
                    }
                }
            )
            const { transactionId } = res.data

            console.log('response', res.data)
            swal(`Success:`, `File uploaded with transaction ID\n${transactionId}`, 'success')
        } catch (err) {
            if (axios.isAxiosError(err)) {
                swal('Error', err.response?.data?.err?.reason, 'error')
            } else {
                swal('Error', `Could not set identity: ${err}`, 'error')
            }
            setIsLoading(false)
        }
    }

    return <Upload onUpload={handleUpload} />
}
