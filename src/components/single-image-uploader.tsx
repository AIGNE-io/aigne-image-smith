import { UploaderButton } from './uploader';

interface SingleImageUploaderProps {
  onImageChange: (image: string | null) => void;
  isLoggedIn: boolean;
  openLoginDialog: () => void;
  disabled?: boolean;
  imageDescription?: string;
}

export function SingleImageUploader({
  onImageChange,
  isLoggedIn,
  openLoginDialog,
  disabled = false,
  imageDescription,
}: SingleImageUploaderProps) {
  const handleImageUpload = async (res: any) => {
    if (!res || !res.response || !res.response.data) {
      return;
    }

    const newImage = res.response.data.filename;
    onImageChange(newImage);
  };

  // 如果有图片，显示图片预览
  // if (image) {
  //   return (
  //     <ImagePreviewCard>
  //       <img
  //         src={getImageUrl(image)}
  //         alt="Uploaded image"
  //         style={{
  //           width: '100%',
  //           height: '100%',
  //           objectFit: 'cover',
  //         }}
  //       />
  //       <DeleteButton
  //         className="delete-button"
  //         onClick={handleRemoveImage}
  //         disabled={disabled}
  //       >
  //         <DeleteIcon sx={{ fontSize: 20 }} />
  //       </DeleteButton>
  //     </ImagePreviewCard>
  //   );
  // }

  // 如果没有图片，显示上传区域
  return (
    <UploaderButton
      isLoggedIn={isLoggedIn}
      onChange={handleImageUpload}
      openLoginDialog={openLoginDialog}
      disabled={disabled}
      title={imageDescription || undefined}
    />
  );
}
