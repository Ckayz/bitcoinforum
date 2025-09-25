# Setup File Upload Storage

## 1. Create Storage Bucket in Supabase

1. Go to your **Supabase Dashboard**
2. Navigate to **Storage** in the sidebar
3. Click **Create Bucket**
4. Name: `media`
5. Set as **Public bucket** (check the box)
6. Click **Create bucket**

## 2. Set Storage Policies

Go to **Storage** → **Policies** and create these policies for the `media` bucket:

### Policy 1: Allow authenticated users to upload
```sql
CREATE POLICY "Allow authenticated uploads" ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'media');
```

### Policy 2: Allow public access to files
```sql
CREATE POLICY "Allow public access" ON storage.objects
FOR SELECT TO public
USING (bucket_id = 'media');
```

## 3. Test File Upload

After setup, users can:
- Click **"Choose Image"** or **"Choose Video"** buttons
- Select files from their device
- Files are automatically uploaded to Supabase storage
- URLs are auto-filled in the form

## Features Added:

✅ **File Upload Buttons**:
- "Choose Image" button for posts
- "Choose Video" button for posts  
- Camera emoji button (📷) for comment images

✅ **File Types Supported**:
- Images: jpg, png, gif, webp, etc.
- Videos: mp4, webm, mov, etc.

✅ **User Experience**:
- Click button → File picker opens
- Select file → Auto-upload to Supabase
- URL auto-fills in input field
- Upload progress shown ("Uploading...")

The file upload system is now ready to use!
