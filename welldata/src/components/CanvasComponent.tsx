// src/components/CanvasComponent.tsx
import React, { useRef } from 'react';
import { Box, Button, Heading, VStack } from '@chakra-ui/react';

const CanvasComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    canvas.onmousemove = (e) => {
      ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
      ctx.strokeStyle = '#003399'; // EU Blue
      ctx.lineWidth = 2;
      ctx.stroke();
    };
    canvas.onmouseup = () => {
      canvas.onmousemove = null;
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  const exportCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'health-goal.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  return (
    <Box p={6} bg="gray.50" borderRadius="md" boxShadow="sm" mt={8}>
      <VStack spacing={4}>
        <Heading size="md">Draw your lifestyle-related health goal</Heading>

        <canvas
          ref={canvasRef}
          width={400}
          height={200}
          style={{ border: '2px solid #003399', borderRadius: '4px', cursor: 'crosshair' }}
          onMouseDown={startDrawing}
        />

        <Box>
          <Button colorScheme="eu" mr={3} onClick={clearCanvas}>
            Clear
          </Button>
          <Button colorScheme="eu" variant="outline" onClick={exportCanvas}>
            Download Drawing
          </Button>
        </Box>
      </VStack>
    </Box>
  );
};

export default CanvasComponent;
