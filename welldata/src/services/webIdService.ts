import {
  createSolidDataset,
  buildThing,
  createThing,
  setThing,
  saveSolidDatasetAt,
  getSolidDataset,
  getThing,
  getStringNoLocale,
} from '@inrupt/solid-client';
import { fetch, getDefaultSession } from '@inrupt/solid-client-authn-browser';
import { FOAF, VCARD } from '@inrupt/vocab-common-rdf';

export async function createWelldataWebId(podUrl: string): Promise<string> {
  try {
    const session = getDefaultSession();
    if (!session.info.isLoggedIn || !session.info.webId) {
      throw new Error('User must be logged in to create a WebID');
    }

    // Create a new dataset for the welldata WebID profile
    const webIdDataset = createSolidDataset();
    
    // Create the welldata WebID profile
    const webIdThing = buildThing(createThing({ name: 'welldata-profile' }))
      .addStringNoLocale(FOAF.name, 'WellData Pod')
      .addStringNoLocale(FOAF.homepage, podUrl)
      .addStringNoLocale(VCARD.role, 'WellData Health Data Pod')
      .addStringNoLocale(VCARD.organization, 'WellData')
      .build();

    // Add the WebID profile to the dataset
    const updatedDataset = setThing(webIdDataset, webIdThing);

    // Save the WebID profile
    const webIdUrl = `${podUrl}profile/card#welldata-profile`;
    await saveSolidDatasetAt(`${podUrl}profile/card`, updatedDataset, { fetch });

    // Link the welldata WebID to the user's WebID
    const userWebId = session.info.webId;
    const userDataset = await getSolidDataset(userWebId, { fetch });
    const userThing = getThing(userDataset, userWebId);
    
    if (userThing) {
      const updatedUserThing = buildThing(userThing)
        .addUrl(FOAF.primaryTopic, webIdUrl)
        .build();
      
      const updatedUserDataset = setThing(userDataset, updatedUserThing);
      await saveSolidDatasetAt(userWebId, updatedUserDataset, { fetch });
    }

    console.log('Created welldata WebID at:', webIdUrl);
    return webIdUrl;
  } catch (error) {
    console.error('Error creating welldata WebID:', error);
    throw error;
  }
} 