import React, { useEffect, useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Spinner,
  Box
} from '@chakra-ui/react';
import { getFHIRPlan, FHIRPlan } from '../services/fhirService';

interface FhirPlanModalProps {
  planUrl: string;
}

const FhirPlanModal: React.FC<FhirPlanModalProps> = ({ planUrl }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [plan, setPlan] = useState<FHIRPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlan = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedPlan = await getFHIRPlan(planUrl);
      setPlan(fetchedPlan);
    } catch (err) {
      console.error('Error fetching FHIR plan:', err);
      setError('Failed to fetch FHIR plan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPlan();
    }
  }, [isOpen]);

  return (
    <>
      <Button onClick={onOpen}>View FHIR Plan</Button>
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>FHIR Plan</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading && <Spinner />}
            {error && <Box color="red.500">{error}</Box>}
            {plan && !loading && (
              <Box as="pre" whiteSpace="pre-wrap">
                {JSON.stringify(plan, null, 2)}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button onClick={onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FhirPlanModal; 