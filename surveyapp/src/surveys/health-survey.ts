import { SurveyDefinition } from './types';

export const healthSurvey: SurveyDefinition = {
  resourceType: 'Questionnaire',
  id: 'health-risk-assessment',
  title: 'Health Risk Assessment Survey',
  description: 'A comprehensive health risk assessment survey based on the Gezondheidsgids.be questionnaire',
  status: 'active',
  date: new Date().toISOString(),
  meta: {
    tag: [
      {
        system: 'http://terminology.hl7.org/CodeSystem/v3-ActCode',
        code: 'SURVEY',
        display: 'Survey'
      }
    ]
  },
  item: [
    {
      linkId: 'hypertension_medication',
      type: 'choice',
      required: true,
      text: 'Neem je medicatie voor een te hoge bloeddruk?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'diabetes',
      type: 'choice',
      required: true,
      text: 'Heb je diabetes (suikerziekte)?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'cardiovascular_disease',
      type: 'choice',
      required: true,
      text: 'Heb je een hart- of vaatziekte (gehad)? (hartinfarct, beroerte, vaatvernauwing)',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'family_history_male_cv',
      type: 'choice',
      required: true,
      text: 'Heeft je vader of broer een hart of vaatziekte voor 55 jaar (gehad)?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'family_history_female_cv',
      type: 'choice',
      required: true,
      text: 'Heeft je moeder of zus een hart of vaatziekte voor 65 jaar (gehad)?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'smoking',
      type: 'choice',
      required: true,
      text: 'Rook je?',
      answerOption: [
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] }
      ]
    },
    {
      linkId: 'alcohol_consumption',
      type: 'choice',
      required: true,
      text: 'Gebruik je alcoholische dranken, zoals bier, wijn of sterke drank?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] }
      ]
    },
    {
      linkId: 'vegetable_consumption',
      type: 'choice',
      required: true,
      text: 'Hoe vaak eet je groenten of salade, uitgezonderd sap en aardappelen?',
      answerOption: [
        { valueString: 'daily', valueCoding: [{ system: 'http://snomed.info/sct', code: '307166007', display: '1 of meer keer per dag' }] },
        { valueString: 'weekly_4_6', valueCoding: [{ system: 'http://snomed.info/sct', code: '307167003', display: '4 tot 6 keer per week' }] },
        { valueString: 'weekly_1_3', valueCoding: [{ system: 'http://snomed.info/sct', code: '307168008', display: '1 tot 3 keer per week' }] },
        { valueString: 'less_than_weekly', valueCoding: [{ system: 'http://snomed.info/sct', code: '307169000', display: 'Minder dan 1 keer per week' }] },
        { valueString: 'never', valueCoding: [{ system: 'http://snomed.info/sct', code: '307170004', display: 'Nooit' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'fruit_consumption',
      type: 'choice',
      required: true,
      text: 'Hoe vaak eet je fruit, uitgezonderd sap?',
      answerOption: [
        { valueString: 'daily', valueCoding: [{ system: 'http://snomed.info/sct', code: '307166007', display: '1 of meer keer per dag' }] },
        { valueString: 'weekly_4_6', valueCoding: [{ system: 'http://snomed.info/sct', code: '307167003', display: '4 tot 6 keer per week' }] },
        { valueString: 'weekly_1_3', valueCoding: [{ system: 'http://snomed.info/sct', code: '307168008', display: '1 tot 3 keer per week' }] },
        { valueString: 'less_than_weekly', valueCoding: [{ system: 'http://snomed.info/sct', code: '307169000', display: 'Minder dan 1 keer per week' }] },
        { valueString: 'never', valueCoding: [{ system: 'http://snomed.info/sct', code: '307170004', display: 'Nooit' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'physical_activity',
      type: 'choice',
      required: true,
      text: 'Beweeg je dagelijks minstens een half uur (vb. fietsen, stevig wandelen, zwemmen, tuinieren, ...)?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'elevated_blood_sugar',
      type: 'choice',
      required: true,
      text: 'Werd er ooit een verhoogde bloedsuikerwaarde bij je vastgesteld? (vb. bij ziekenhuisopname, routinecontrole of zwangerschap)?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'family_history_diabetes_siblings',
      type: 'choice',
      required: true,
      text: 'Heeft je vader, moeder, broer of zus diabetes?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'family_history_diabetes_extended',
      type: 'choice',
      required: true,
      text: 'Heeft je grootvader, grootmoeder, oom of tante diabetes?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'tetanus_vaccination',
      type: 'choice',
      required: true,
      text: 'Is je vaccinatie tegen tetanus meer dan tien jaar geleden?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'lung_patient',
      type: 'choice',
      required: true,
      text: 'Ben je longpatiënt?',
      helpText: 'Een longpatient heeft een chronische (langdurige) aandoening van zijn longen, waardoor de werking van de longen verstoord is. (vb. asthma, chronische bronchitis)',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'heart_patient',
      type: 'choice',
      required: true,
      text: 'Ben je hartpatient?',
      helpText: 'Een hartpatient is een patiënt met een chronische (langdurige) ziekte van het hart, waardoor de werking van het hart is verstoord. (vb. hartfalen of vernauwing van de kransslagaders)',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'liver_patient',
      type: 'choice',
      required: true,
      text: 'Ben je leverpatiënt?',
      helpText: 'Een leverpatient is een patient met een chronische (langdurige) ziekte van de lever, waardoor de werking van de lever is verstoord.',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'kidney_patient',
      type: 'choice',
      required: true,
      text: 'Ben je nierpatiënt?',
      helpText: 'Een nierpatient is een patient met een chronische (langdurige) ziekte van de nieren, waardoor de werking van de nieren (nierfunctie) is verstoord.',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'family_history_colon_cancer',
      type: 'choice',
      required: true,
      text: 'Komt er darmkanker voor bij je vader, moeder, broer of zus?',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'height',
      type: 'number',
      required: true,
      text: 'Lengte (cm)?',
      validation: {
        min: 50,
        max: 250
      }
    },
    {
      linkId: 'weight',
      type: 'number',
      required: true,
      text: 'Gewicht (kg)?',
      validation: {
        min: 20,
        max: 300
      }
    },
    {
      linkId: 'bmi',
      type: 'number',
      required: true,
      text: 'BMI',
      helpText: 'BMI staat voor Body Mass index. Het berekent de verhouding tussen je lengte en gewicht en kan gebruikt worden om je ideale gewicht te berekenen.',
      validation: {
        min: 10,
        max: 50
      }
    },
    {
      linkId: 'waist_circumference',
      type: 'number',
      required: true,
      text: 'Buikomtrek (cm)?',
      helpText: 'Meet je buikomtrek op je blote huid, na een normale uitademing, zonder druk uit te oefenen. Juiste hoogte? Plaats je hand in je zij midden tussen je onderste rib en de bovenkant van je bekken, dit is de correcte plaats!',
      validation: {
        min: 50,
        max: 200
      }
    },
    {
      linkId: 'systolic_blood_pressure',
      type: 'number',
      required: true,
      text: 'Systolische bloeddruk (mmHg)',
      helpText: 'De systolische bloeddruk (of: bovendruk) is de druk tijdens het samentrekken van het hart, waarbij het bloed slagaders wordt gepompt. Wanneer dokter zegt een bloeddruk van 120 over 70 (of 12 over 7) is 120 de systolische bloeddruk',
      validation: {
        min: 70,
        max: 250
      }
    },
    {
      linkId: 'microalbuminuria',
      type: 'choice',
      required: true,
      text: 'Heb je microalbuminurie?',
      helpText: 'Microalbuminurie is het voorkomen van kleine hoeveelheden eiwitten in de urine, die daar normaal niet thuishoren.',
      answerOption: [
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'crohns_disease',
      type: 'choice',
      required: true,
      text: 'Heb je reeds meer dan 8 jaar de ziekte van Crohn?',
      helpText: 'De ziekte Crohn is een chronische, dus langdurige, ontsteking van de slijmvliezen van het maag-darmkanaal.',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'ulcerative_colitis',
      type: 'choice',
      required: true,
      text: 'Heb je al meer dan 8 jaar colitis ulcerosa?',
      helpText: 'Colitis Ulcerosa is een chronische, dus langdurige, ontsteking van de dikke darm.',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'colonoscopy',
      type: 'choice',
      required: true,
      text: 'Onderging je de laatste 10 jaar een coloscopie?',
      helpText: 'Colonoscopie (of coloscopie) is een onderzoek waarbij men een soepele buis met camera (een endoscoop) via de anus inbrengt om de dikke darm en het laatste stuk van de dunne darm te bekijken.',
      answerOption: [
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    },
    {
      linkId: 'family_history_hypercholesterolemia',
      type: 'choice',
      required: true,
      text: 'Is er een geschiedenis van hypercholesterolemie in jouw familie?',
      helpText: 'Familiale Hypercholesterolemie is een erfelijke stofwisselingsziekte waarbij te veel cholesterol in het bloed aanwezig is. Dit al vanaf de geboorte en onafhankelijk van vb. slechte eetgewoonten',
      answerOption: [
        { valueString: 'yes', valueCoding: [{ system: 'http://snomed.info/sct', code: '373066001', display: 'Ja' }] },
        { valueString: 'no', valueCoding: [{ system: 'http://snomed.info/sct', code: '373067005', display: 'Nee' }] },
        { valueString: 'unknown', valueCoding: [{ system: 'http://snomed.info/sct', code: '261665006', display: 'Weet niet' }] }
      ]
    }
  ]
}; 