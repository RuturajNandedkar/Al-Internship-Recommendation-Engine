const {
  generateAIRecommendation,
} = require("../services/openaiService");

/**
 * @desc    Get AI-powered internship recommendations
 * @route   POST /api/ai-recommendation
 * @body    { skills: string[], interests: string[], experience: string }
 * @access  Public
 */
const getAIRecommendation = async (req, res, next) => {
  try {
    const { skills, interests, experience } = req.body;

    const recommendation = await generateAIRecommendation({
      skills,
      interests,
      experience,
    });

    res.status(200).json({
      success: true,
      data: recommendation,
    });
  } catch (error) {
    // Surface OpenAI-specific errors clearly
    if (error.status === 401) {
      const err = new Error("Invalid OpenAI API key");
      err.statusCode = 401;
      return next(err);
    }
    if (error.status === 429) {
      const err = new Error("OpenAI rate limit exceeded. Please try again later.");
      err.statusCode = 429;
      return next(err);
    }
    next(error);
  }
};

module.exports = { getAIRecommendation };
