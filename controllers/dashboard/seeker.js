const { SeekerSerializer } = require("../../serializers/seeker");
const { Seeker } = require("../../models/seeker");
const { Vacancy, VacancyMatch } = require("../../models/vacancy");
const { RefererVacancySerializer } = require("../../serializers/referer");

exports.getRefererSeeked = async (req, res, next) => {
  try {
    // Access seeker ID from the data array
    const seekerId = req.seeker.id;

    const vacancySeekedFetchedData = await VacancyMatch.findBySeekerId(
      seekerId
    );

    // Check if data exists
    if (
      !vacancySeekedFetchedData.data ||
      vacancySeekedFetchedData.data.length === 0
    ) {
      return res.status(200).json({ refererVacancies: [] });
    }

    const vacancyIdArray = vacancySeekedFetchedData.data.map(
      (obj) => obj.vacancy_id
    );
    const vacancyFetchedData = await Vacancy.findByArray(vacancyIdArray);

    // Check if vacancies exist
    if (!vacancyFetchedData.data || vacancyFetchedData.data.length === 0) {
      return res.status(200).json({ refererVacancies: [] });
    }

    const serializedResponse = await RefererVacancySerializer.serializeAll(
      vacancyFetchedData.data
    );

    return res.status(200).json(serializedResponse);
  } catch (error) {
    console.error("Error in getRefererSeeked:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
