import React, { useState, useEffect } from "react";
import { Box, TextInput, Image, Title, Stack, Table } from "@mantine/core";

interface Constituency {
  "State/UT": string;
  PCName: string;
  "Alternate Spellings": string[];
}

interface StateVernacular {
  State: string;
  Vernacular: string | null;
}

const ConstituencyGame: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [correctGuesses, setCorrectGuesses] = useState<{
    [state: string]: string[];
  }>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [data, setData] = useState<Constituency[]>([]);
  const [stateVernacularMap, setStateVernacularMap] = useState<{
    [state: string]: string | null;
  }>({});

  const formatName = (name: string) => {
    return name.toLowerCase().replace(/\band\b|\&|\s+|\-+|\\.+/g, "");
  };

  useEffect(() => {
    Promise.all([
      fetch(`${process.env.PUBLIC_URL}/constituencies_formatted_v1-2.json`),
      fetch(`${process.env.PUBLIC_URL}/state_to_vernacular_v1-1.json`),
    ])
      .then(([constituenciesResponse, vernacularResponse]) =>
        Promise.all([constituenciesResponse.json(), vernacularResponse.json()])
      )
      .then(([constituencyData, vernacularData]) => {
        setData(constituencyData as Constituency[]);
        const vernacularMap: { [state: string]: string | null } = {};
        (vernacularData as StateVernacular[]).forEach((entry) => {
          vernacularMap[entry.State] = entry.Vernacular;
        });
        setStateVernacularMap(vernacularMap);
      })
      .catch((error) => console.error("Error loading JSON:", error));
  }, []);

  useEffect(() => {
    const formattedInput = formatName(input);
    let newGuesses = 0;
    let updatedGuesses: {
      [state: string]: string[];
    } = {};

    data.forEach((constituency) => {
      const formattedConstituency = formatName(constituency.PCName);
      const formattedAlternateSpellings = constituency[
        "Alternate Spellings"
      ].map((spelling: string) => formatName(spelling));

      if (
        formattedConstituency === formattedInput ||
        formattedAlternateSpellings.includes(formattedInput)
      ) {
        const state = constituency["State/UT"];
        const constituencyName = constituency.PCName;
        const guessesForState = correctGuesses[state] || [];

        if (!guessesForState.includes(constituencyName)) {
          newGuesses += 1;
          updatedGuesses[state] = [...guessesForState, constituencyName];
        } else {
          updatedGuesses[state] = [...guessesForState];
        }
      }
    });

    if (newGuesses > 0) {
      setCorrectGuesses((prev) => ({
        ...prev,
        ...updatedGuesses,
      }));
      setCorrectCount((prevCount) => prevCount + newGuesses);
      setInput("");
    }
  }, [input, correctGuesses, data]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = event.currentTarget.value;
    setInput(newInput);
  };

  const getTotalConstituenciesInState = (state: string) => {
    return data.filter((constituency) => constituency["State/UT"] === state)
      .length;
  };

  const rows = Object.entries(correctGuesses)
    .sort(([stateA], [stateB]) => stateA.localeCompare(stateB))
    .map(([state, guesses]) => (
      <Table.Tr key={state}>
        <Table.Td style={{ width: 200, maxWidth: 400 }}>
          {state}
          {stateVernacularMap[state] && (
            <>
              <br />
              {stateVernacularMap[state]}
            </>
          )}
        </Table.Td>
        <Table.Td style={{ width: 200, textAlign: "center" }}>
          {guesses.length} / {getTotalConstituenciesInState(state)}
        </Table.Td>
        <Table.Td style={{ maxWidth: 800 }}>{guesses.join(", ")}</Table.Td>
      </Table.Tr>
    ));

  return (
    <Box>
      <Stack
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",

          marginTop: 50,
          marginLeft: 50,
          marginRight: 50,
          marginBottom: 20,
        }}
      >
        <Image
          src={`${process.env.PUBLIC_URL}/emblem_of_india.svg`}
          alt="Emblem of India"
          w={100}
        />
        <Title order={1} style={{ marginBottom: "1rem" }}>
          Guess the Lok Sabha Constituencies!
        </Title>
      </Stack>
      <Stack
        style={{
          position: "sticky",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1,
          backgroundColor: "white",
          paddingTop: 20,
          paddingBottom: 20,
          paddingLeft: 50,
          paddingRight: 50,
          borderBottom: "1px solid #eaeaea",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <TextInput
          size="md"
          label="Constituency Name (निर्वाचन क्षेत्र का नाम)"
          placeholder="Start typing..."
          onChange={handleInputChange}
          value={input}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            fontSize: "1rem",
            width: "100%",
            maxWidth: "500px",
          }}
        />
        <Title order={2}>{correctCount} / 543</Title>
      </Stack>
      <Box
        style={{
          marginTop: 50,
          marginBottom: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
        }}
      >
        <Table
          highlightOnHover
          style={{
            width: "auto",
            minWidth: "800px",
            maxWidth: "100%",
          }}
        >
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 200, maxWidth: 400 }}>
                State/UT
              </Table.Th>
              <Table.Th style={{ width: 200 }}># Correct / # Total</Table.Th>
              <Table.Th style={{ maxWidth: 800 }}>
                Constituencies Guessed
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Box>
    </Box>
  );
};

export default ConstituencyGame;
