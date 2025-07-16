import React from 'react';

const HealthRecommendations = ({ userData, aqiData }) => {
  // Calculate age from date of birth
  const calculateAge = (dob) => {
    if (!dob) return 30; // Default to adult age if dob is invalid
    const birthDate = new Date(dob);
    if (isNaN(birthDate)) return 30;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // EPA AQI categories
  const getAQICategory = (aqi) => {
    if (!aqi || aqi < 0) return 'Good';
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  const age = calculateAge(userData?.dob);
  const ageGroup = age < 18 ? 'child' : age >= 65 ? 'senior' : 'adult';
  const conditions = userData?.diseases || [];
  const aqi = aqiData?.aqi || 0;
  const aqiCategory = getAQICategory(aqi);

  const recommendations = {
    'Respiratory conditions': {
      child: {
        Good: ['Enjoy outdoor activities but monitor for symptoms.'],
        Moderate: ['Limit prolonged outdoor exertion; use inhalers as needed.'],
        'Unhealthy for Sensitive Groups': ['Avoid outdoor activities; keep rescue inhalers accessible.'],
        Unhealthy: ['Stay indoors; use an air purifier with HEPA filters.'],
        'Very Unhealthy': ['Remain indoors; follow asthma action plan.'],
        Hazardous: ['Stay indoors; seek medical advice if symptoms worsen.'],
      },
      adult: {
        Good: ['Outdoor activities are safe; check air quality forecasts daily.'],
        Moderate: ['Reduce prolonged outdoor activities; wear N95 masks if sensitive.'],
        'Unhealthy for Sensitive Groups': ['Avoid outdoor exercise; use N95 masks outdoors.'],
        Unhealthy: ['Stay indoors; create an asthma action plan if needed.'],
        'Very Unhealthy': ['Remain indoors; use air purifiers and monitor symptoms.'],
        Hazardous: ['Avoid all outdoor exposure; consult a doctor if symptoms appear.'],
      },
      senior: {
        Good: ['Outdoor activities are safe; stay hydrated.'],
        Moderate: ['Limit outdoor time; get annual flu vaccinations.'],
        'Unhealthy for Sensitive Groups': ['Stay indoors on high pollution days; use air purifiers.'],
        Unhealthy: ['Avoid outdoor exposure; maintain good indoor air quality.'],
        'Very Unhealthy': ['Stay in air-conditioned spaces; reduce dust and mold.'],
        Hazardous: ['Remain indoors; seek medical help if respiratory issues worsen.'],
      },
    },
    'Cardiovascular disease': {
      child: {
        Good: ['Enjoy outdoor activities; maintain a heart-healthy diet.'],
        Moderate: ['Limit strenuous outdoor activities; monitor heart rate.'],
        'Unhealthy for Sensitive Groups': ['Avoid strenuous activities; ensure regular screenings.'],
        Unhealthy: ['Stay indoors; follow medical advice for heart conditions.'],
        'Very Unhealthy': ['Remain indoors; keep medications accessible.'],
        Hazardous: ['Stay indoors; seek immediate medical help if symptoms appear.'],
      },
      adult: {
        Good: ['Outdoor activities are safe; monitor blood pressure regularly.'],
        Moderate: ['Reduce outdoor exercise; avoid high-pollution areas.'],
        'Unhealthy for Sensitive Groups': ['Avoid outdoor exercise; use air purifiers.'],
        Unhealthy: ['Stay indoors; follow a heart-healthy diet.'],
        'Very Unhealthy': ['Remain indoors; manage stress with relaxation techniques.'],
        Hazardous: ['Avoid all outdoor exposure; consult a doctor if symptoms worsen.'],
      },
      senior: {
        Good: ['Outdoor activities are safe; stay hydrated and monitor health.'],
        Moderate: ['Limit outdoor time; avoid secondhand smoke.'],
        'Unhealthy for Sensitive Groups': ['Stay in air-conditioned environments; monitor blood pressure.'],
        Unhealthy: ['Avoid outdoor exposure; use air purifiers.'],
        'Very Unhealthy': ['Remain indoors; manage stress and monitor symptoms.'],
        Hazardous: ['Stay indoors; seek medical help if heart issues arise.'],
      },
    },
    'Chronic Diseases & Other Conditions': {
      child: {
        Good: ['Enjoy outdoor activities; maintain regular check-ups.'],
        Moderate: ['Limit outdoor exertion; follow medication schedules.'],
        'Unhealthy for Sensitive Groups': ['Avoid outdoor activities; have an emergency plan.'],
        Unhealthy: ['Stay indoors; ensure medication availability.'],
        'Very Unhealthy': ['Remain indoors; monitor chronic conditions closely.'],
        Hazardous: ['Stay indoors; seek medical advice for worsening symptoms.'],
      },
      adult: {
        Good: ['Outdoor activities are safe; stay hydrated and get adequate sleep.'],
        Moderate: ['Monitor air quality alerts; reduce outdoor time.'],
        'Unhealthy for Sensitive Groups': ['Limit outdoor activities; use air purifiers.'],
        Unhealthy: ['Stay indoors; maintain a consistent medication schedule.'],
        'Very Unhealthy': ['Remain indoors; ensure good sleep and hydration.'],
        Hazardous: ['Avoid outdoor exposure; consult a doctor if symptoms worsen.'],
      },
      senior: {
        Good: ['Outdoor activities are safe; get regular health exams.'],
        Moderate: ['Limit outdoor time; keep emergency contacts available.'],
        'Unhealthy for Sensitive Groups': ['Stay indoors; maintain social connections.'],
        Unhealthy: ['Avoid outdoor exposure; use air purifiers.'],
        'Very Unhealthy': ['Remain indoors; monitor chronic conditions closely.'],
        Hazardous: ['Stay indoors; seek medical help if symptoms worsen.'],
      },
    },
  };

  const generalRecommendations = {
    Good: ['Safe to enjoy outdoor activities; check air quality forecasts daily.'],
    Moderate: ['Monitor air quality; stay hydrated and consider air purifiers.'],
    'Unhealthy for Sensitive Groups': ['Limit outdoor activities; keep windows closed.'],
    Unhealthy: ['Stay indoors when possible; use HEPA air purifiers.'],
    'Very Unhealthy': ['Remain indoors; have a plan for cleaner air locations (e.g., libraries).'],
    Hazardous: ['Avoid all outdoor exposure; use air purifiers and seek medical advice if needed.'],
  };

  const hasValidConditions = conditions.some(condition =>
    recommendations.hasOwnProperty(condition)
  );

  // Debug logs
  console.log('userData:', userData);
  console.log('conditions:', conditions);
  console.log('hasValidConditions:', hasValidConditions);
  console.log('aqi:', aqi, 'category:', aqiCategory);

  // Handle missing user data
  if (!userData) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          Health Recommendations
        </h2>
        <p className="text-gray-600 dark:text-gray-300">Unable to load user data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Health Recommendations
      </h2>
      {age && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Personalized for {ageGroup === 'child' ? 'children' : ageGroup === 'senior' ? 'seniors' : 'adults'} (age {age})
        </p>
      )}
      {aqiCategory && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Current AQI: {aqi} ({aqiCategory})
        </p>
      )}
      {hasValidConditions ? (
        <div>
          {conditions
            .filter(condition => recommendations[condition])
            .map(condition => (
              <div key={condition} className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
                  {condition}
                </h3>
                <ul className="list-disc pl-5 space-y-2">
                  {recommendations[condition][ageGroup][aqiCategory].map((rec, index) => (
                    <li key={index} className="text-gray-600 dark:text-gray-300">
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">
              General Recommendations
            </h3>
            <ul className="list-disc pl-5 space-y-2">
              {generalRecommendations[aqiCategory].map((rec, index) => (
                <li key={index} className="text-gray-600 dark:text-gray-300">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            No specific health conditions selected. Here are general recommendations:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            {generalRecommendations[aqiCategory].map((rec, index) => (
              <li key={index} className="text-gray-600 dark:text-gray-300">
                {rec}
              </li>
            ))}
          </ul>
          {age && ageGroup === 'senior' && (
            <div className="mt-4">
              <p className="text-gray-600 dark:text-gray-300">
                As a senior, consider getting regular health check-ups and staying up-to-date with vaccinations.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HealthRecommendations;