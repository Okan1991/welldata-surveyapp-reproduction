import { SurveyTranslation } from '../types';

export const healthSurveyEN: SurveyTranslation = {
  language: 'en',
  title: 'Health Risk Assessment',
  description: 'A comprehensive health risk assessment survey based on the Gezondheidsgids.be questionnaire',
  item: [
    {
      linkId: 'hypertension_medication',
      text: 'Do you take medication for high blood pressure?'
    },
    {
      linkId: 'diabetes',
      text: 'Do you have diabetes?'
    },
    {
      linkId: 'cardiovascular_disease',
      text: 'Do you have (or have you had) cardiovascular disease? (heart attack, stroke, vascular stenosis)'
    },
    {
      linkId: 'family_history_male_cv',
      text: 'Has your father or brother had cardiovascular disease before age 55?'
    },
    {
      linkId: 'family_history_female_cv',
      text: 'Has your mother or sister had cardiovascular disease before age 65?'
    },
    {
      linkId: 'smoking',
      text: 'Do you smoke?'
    },
    {
      linkId: 'alcohol_consumption',
      text: 'Do you consume alcoholic beverages, such as beer, wine, or spirits?'
    },
    {
      linkId: 'vegetable_consumption',
      text: 'How often do you eat vegetables or salad, excluding juice and potatoes?'
    },
    {
      linkId: 'fruit_consumption',
      text: 'How often do you eat fruit, excluding juice?'
    },
    {
      linkId: 'physical_activity',
      text: 'Do you exercise for at least half an hour daily? (e.g., cycling, brisk walking, swimming, gardening, ...)'
    },
    {
      linkId: 'elevated_blood_sugar',
      text: 'Have you ever been diagnosed with elevated blood sugar? (e.g., during hospitalization, routine check-up, or pregnancy)'
    },
    {
      linkId: 'family_history_diabetes_siblings',
      text: 'Does your father, mother, brother, or sister have diabetes?'
    },
    {
      linkId: 'family_history_diabetes_extended',
      text: 'Does your grandfather, grandmother, uncle, or aunt have diabetes?'
    },
    {
      linkId: 'tetanus_vaccination',
      text: 'Is your tetanus vaccination more than ten years old?'
    },
    {
      linkId: 'lung_patient',
      text: 'Are you a lung patient?',
      helpText: 'A lung patient has a chronic (long-term) condition affecting their lungs, which impairs lung function. (e.g., asthma, chronic bronchitis)'
    },
    {
      linkId: 'heart_patient',
      text: 'Are you a heart patient?',
      helpText: 'A heart patient has a chronic (long-term) heart condition that impairs heart function. (e.g., heart failure or coronary artery stenosis)'
    },
    {
      linkId: 'liver_patient',
      text: 'Are you a liver patient?',
      helpText: 'A liver patient has a chronic (long-term) liver condition that impairs liver function.'
    },
    {
      linkId: 'kidney_patient',
      text: 'Are you a kidney patient?',
      helpText: 'A kidney patient has a chronic (long-term) kidney condition that impairs kidney function.'
    },
    {
      linkId: 'family_history_colon_cancer',
      text: 'Has your father, mother, brother, or sister had colon cancer?'
    },
    {
      linkId: 'height',
      text: 'Height (cm)?'
    },
    {
      linkId: 'weight',
      text: 'Weight (kg)?'
    },
    {
      linkId: 'bmi',
      text: 'BMI',
      helpText: 'BMI stands for Body Mass Index. It calculates the ratio between your height and weight and can be used to determine your ideal weight.'
    },
    {
      linkId: 'waist_circumference',
      text: 'Waist circumference (cm)?',
      helpText: 'Measure your waist circumference on bare skin, after a normal exhalation, without applying pressure. Correct height? Place your hand on your side halfway between your bottom rib and the top of your pelvis, this is the correct position!'
    },
    {
      linkId: 'systolic_blood_pressure',
      text: 'Systolic blood pressure (mmHg)',
      helpText: 'Systolic blood pressure (or: top number) is the pressure during heart contraction, when blood is pumped into the arteries. When the doctor says a blood pressure of 120 over 70 (or 12 over 7), 120 is the systolic blood pressure'
    },
    {
      linkId: 'microalbuminuria',
      text: 'Do you have microalbuminuria?',
      helpText: 'Microalbuminuria is the presence of small amounts of protein in the urine, where they normally do not belong.'
    },
    {
      linkId: 'crohns_disease',
      text: 'Have you had Crohn\'s disease for more than 8 years?',
      helpText: 'Crohn\'s disease is a chronic, long-term inflammation of the mucous membranes of the gastrointestinal tract.'
    },
    {
      linkId: 'ulcerative_colitis',
      text: 'Have you had ulcerative colitis for more than 8 years?',
      helpText: 'Ulcerative colitis is a chronic, long-term inflammation of the large intestine.'
    },
    {
      linkId: 'colonoscopy',
      text: 'Have you had a colonoscopy in the last 10 years?',
      helpText: 'Colonoscopy is an examination where a flexible tube with a camera (an endoscope) is inserted through the anus to examine the large intestine and the last part of the small intestine.'
    },
    {
      linkId: 'family_history_hypercholesterolemia',
      text: 'Is there a history of hypercholesterolemia in your family?',
      helpText: 'Familial Hypercholesterolemia is an inherited metabolic disorder where there is too much cholesterol in the blood. This is present from birth and independent of e.g., poor eating habits'
    }
  ]
}; 