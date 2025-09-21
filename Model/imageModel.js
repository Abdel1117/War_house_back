const mongoose = require("mongoose");

const imageSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  resolution: { type: String, required: true, trim: true },
  category: { type: [String], default: [] },
  addedBy: { type: String, required: true, trim: true },
  published: { type: Date, default: Date.now },
  favorite: { type: Number, default: 0, min: 0 },
  pegi18: { type: Boolean, default: false },
  view: { type: Number, default: 0, min: 0 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual field: rate = favorite * 5
imageSchema.virtual('rate').get(function () {
  return (this.favorite || 0) * 5;
});

module.exports = mongoose.model('Image', imageSchema);
