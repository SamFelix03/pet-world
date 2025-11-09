import React, { useState } from "react";
import { Layout, Text } from "@stellar/design-system";
import { PetList } from "../components/PetList";
import { PetDetail } from "../components/PetDetail";

const Home: React.FC = () => {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);

  return (
    <Layout.Content>
      <Layout.Inset>
        {selectedPetId === null ? (
          <>
            <Text as="h1" size="xl">
              🐾 PetWorld
            </Text>
            <Text as="p" size="md" style={{ marginBottom: '32px' }}>
              Your virtual pets on Stellar blockchain. Chat with them, feed them, and watch them evolve!
            </Text>
            <PetList 
              onSelectPet={(tokenId) => setSelectedPetId(tokenId)}
              selectedPetId={selectedPetId}
            />
          </>
        ) : (
          <PetDetail 
            tokenId={selectedPetId}
            onBack={() => setSelectedPetId(null)}
          />
        )}
      </Layout.Inset>
    </Layout.Content>
  );
};

export default Home;
