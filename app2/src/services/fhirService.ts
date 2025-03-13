import { getSolidDataset, saveSolidDatasetAt, createSolidDataset, createThing, buildThing, setThing, Thing, ThingPersisted, getStringNoLocale, getDate, getThingAll } from '@inrupt/solid-client';
import { fetch } from '@inrupt/solid-client-authn-browser';
import { RDF_PREDICATES, FHIR_NAMESPACE } from '../constants/rdf';

export interface FHIRPlan {
  id: string;
  title: string;
  description: string;
  status: 'draft' | 'active' | 'completed';
  created: Date;
  modified: Date;
  author: string;
  goal: string;
  target: {
    code: string;
    frequency: string;
  };
  actions: Array<{
    title: string;
    description: string;
    frequency: string;
  }>;
}

export function convertToFHIRJSON(plan: FHIRPlan): any {
  console.log('Converting plan to FHIR JSON:', plan);
  
  const fhirPlan = {
    resourceType: 'PlanDefinition',
    id: plan.id,
    title: plan.title,
    description: plan.description,
    status: plan.status,
    date: plan.created.toISOString(),
    lastModified: plan.modified.toISOString(),
    author: [{
      display: plan.author
    }],
    goal: [{
      description: {
        text: plan.goal
      }
    }],
    action: plan.actions.map(action => ({
      title: action.title,
      description: action.description,
      timing: {
        repeat: {
          frequency: action.frequency === 'weekly' ? 1 : 0,
          period: action.frequency === 'weekly' ? 7 : 30,
          periodUnit: 'd'
        }
      }
    })),
    extension: [{
      url: 'http://hl7.org/fhir/StructureDefinition/PlanDefinition-target',
      valueCodeableConcept: {
        coding: [{
          system: plan.target.code.split('#')[0],
          code: plan.target.code.split('#')[1],
          display: 'Use of mobile health application'
        }]
      }
    }]
  };

  console.log('Generated FHIR JSON:', fhirPlan);
  return fhirPlan;
}

export function downloadFHIRJSON(plan: FHIRPlan, filename: string): void {
  const fhirJson = convertToFHIRJSON(plan);
  const blob = new Blob([JSON.stringify(fhirJson, null, 2)], { type: 'application/json' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

export async function createInitialFHIRPlan(podUrl: string): Promise<void> {
  try {
    // Create a new dataset for the FHIR plan
    const planDataset = createSolidDataset();
    
    // Create the initial plan thing with all required fields
    const planThing = buildThing(createThing({ name: 'initial-plan' }))
      .addStringNoLocale(FHIR_NAMESPACE('title'), 'WellData Health Engagement Plan')
      .addStringNoLocale(FHIR_NAMESPACE('description'), 'Plan for engaging with WellData apps to maintain and improve health')
      .addStringNoLocale(FHIR_NAMESPACE('status'), 'active')
      .addDate(FHIR_NAMESPACE('created'), new Date())
      .addDate(FHIR_NAMESPACE('modified'), new Date())
      .addStringNoLocale(FHIR_NAMESPACE('author'), 'WellData App')
      .addStringNoLocale(FHIR_NAMESPACE('goal'), 'Stay healthy through WellData apps and share data responsibly to enable better health policy and research')
      .addStringNoLocale(FHIR_NAMESPACE('target'), 'http://snomed.info/sct/713404003')
      .addStringNoLocale(FHIR_NAMESPACE('frequency'), 'weekly')
      // Add actions
      .addStringNoLocale(FHIR_NAMESPACE('action'), JSON.stringify([
        {
          title: 'Initial Action',
          description: 'This is the initial action',
          frequency: 'monthly'
        }
      ]))
      .build();

    // Add the plan thing to the dataset
    const updatedDataset = setThing(planDataset, planThing);

    // Save the dataset to the welldata Pod
    const planUrl = `${podUrl}data/plans/initial-plan.ttl`;
    await saveSolidDatasetAt(planUrl, updatedDataset, { fetch });

    console.log('Initial FHIR plan created successfully at:', planUrl);
  } catch (error) {
    console.error('Error creating initial FHIR plan:', error);
    throw error;
  }
}

export async function getFHIRPlan(planUrl: string): Promise<FHIRPlan | null> {
  try {
    console.log('Fetching FHIR plan from:', planUrl);
    const dataset = await getSolidDataset(planUrl, { fetch });
    console.log('Retrieved dataset:', dataset);
    
    // Get all things from the dataset
    const things = getThingAll(dataset);
    console.log('Retrieved things:', things);
    
    // Find the plan thing by its URL
    const planThing = things.find(thing => 
      thing.url === `${planUrl}#initial-plan`
    );

    if (!planThing) {
      console.log('No plan thing found in dataset');
      return null;
    }

    console.log('Found plan thing:', planThing);
    const actions = JSON.parse(getStringNoLocale(planThing, FHIR_NAMESPACE('action')) || '[]');
    console.log('Parsed actions:', actions);

    const plan = {
      id: 'initial-plan',
      title: getStringNoLocale(planThing, FHIR_NAMESPACE('title')) || '',
      description: getStringNoLocale(planThing, FHIR_NAMESPACE('description')) || '',
      status: getStringNoLocale(planThing, FHIR_NAMESPACE('status')) as FHIRPlan['status'] || 'draft',
      created: (() => {
        const createdString = getStringNoLocale(planThing, FHIR_NAMESPACE('created'));
        return createdString ? new Date(createdString) : new Date();
      })(),
      modified: (() => {
        const modifiedString = getStringNoLocale(planThing, FHIR_NAMESPACE('modified'));
        return modifiedString ? new Date(modifiedString) : new Date();
      })(),
      author: getStringNoLocale(planThing, FHIR_NAMESPACE('author')) || '',
      goal: getStringNoLocale(planThing, FHIR_NAMESPACE('goal')) || '',
      target: {
        code: getStringNoLocale(planThing, FHIR_NAMESPACE('target')) || '',
        frequency: getStringNoLocale(planThing, FHIR_NAMESPACE('frequency')) || ''
      },
      actions
    };

    console.log('Constructed plan:', plan);
    return plan;
  } catch (error) {
    console.error('Error retrieving FHIR plan:', error);
    throw error;
  }
} 