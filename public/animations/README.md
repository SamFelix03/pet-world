# Pet Animation Files

Place your Lottie animation JSON files here for each pet evolution stage:

- `stage-0-egg.json` - Animation for Egg stage (Stage 0)
- `stage-1-baby.json` - Animation for Baby stage (Stage 1)
- `stage-2-teen.json` - Animation for Teen stage (Stage 2)
- `stage-3-adult.json` - Animation for Adult stage (Stage 3)

## Creating Lottie Animations

1. **Using After Effects:**
   - Install the [Bodymovin plugin](https://aescripts.com/bodymovin/)
   - Create your animation in After Effects
   - Export using Bodymovin to get a JSON file

2. **Using LottieFiles:**
   - Use [LottieFiles](https://lottiefiles.com/) to create or find animations
   - Download as JSON format
   - Place in this directory

3. **Alternative Formats:**
   - If you prefer video files, you can use MP4/WebM files
   - Update `PetAvatar.tsx` to use video elements instead
   - Place video files in `/public/animations/` with names like `stage-0-egg.mp4`

## File Naming

The component expects files to be named exactly as:
- `stage-0-egg.json`
- `stage-1-baby.json`
- `stage-2-teen.json`
- `stage-3-adult.json`

If your files have different names, update the `STAGE_ANIMATIONS` object in `src/components/PetAvatar.tsx`.

