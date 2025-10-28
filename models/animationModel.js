import mongoose from 'mongoose';

const animationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    prompt: { type: String, required: true },
    videoUrl: { type: String, required: true },
    manimCode: { type: String },
  },
  { timestamps: true }
);

const animationModel = mongoose.models.animation || mongoose.model('animation', animationSchema);
export default animationModel;