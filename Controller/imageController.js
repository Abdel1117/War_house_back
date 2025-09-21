const Image = require('../Model/imageModel');
const { validationResult } = require('express-validator');

// Create Image
exports.createImage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, resolution, category, addedBy, published, favorite, pegi18, view } = req.body;

    const image = await Image.create({
      title,
      resolution,
      category,
      addedBy,
      published,
      favorite,
      pegi18,
      view
    });

    res.status(201).json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la création de l\'image' });
  }
};

// Get all images (with filters optional)
exports.getImages = async (req, res) => {
  try {
    const { q, category, pegi18 } = req.query;
    const filter = {};

    if (q) {
      filter.title = { $regex: q, $options: 'i' };
    }
    if (category) {
      filter.category = { $in: Array.isArray(category) ? category : [category] };
    }
    if (typeof pegi18 !== 'undefined') {
      filter.pegi18 = pegi18 === 'true' || pegi18 === true;
    }

    const images = await Image.find(filter).sort({ createdAt: -1 });
    res.json(images);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération des images' });
  }
};

// Get image by ID
exports.getImageById = async (req, res) => {
  try {
    const image = await Image.findById(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image non trouvée' });
    res.json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la récupération de l\'image' });
  }
};

// Update image
exports.updateImage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const updates = req.body;
    const image = await Image.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!image) return res.status(404).json({ message: 'Image non trouvée' });
    res.json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'image' });
  }
};

// Delete image
exports.deleteImage = async (req, res) => {
  try {
    const image = await Image.findByIdAndDelete(req.params.id);
    if (!image) return res.status(404).json({ message: 'Image non trouvée' });
    res.json({ message: 'Image supprimée avec succès' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de la suppression de l\'image' });
  }
};

// Increment view counter
exports.incrementView = async (req, res) => {
  try {
    const image = await Image.findByIdAndUpdate(
      req.params.id,
      { $inc: { view: 1 } },
      { new: true }
    );
    if (!image) return res.status(404).json({ message: 'Image non trouvée' });
    res.json(image);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Erreur lors de l\'incrément des vues' });
  }
};
