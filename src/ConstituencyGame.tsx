import React, { useState, useEffect } from "react";
import { TextInput, Image, Title, Stack, Table } from "@mantine/core";

interface Constituency {
  "State/UT": string;
  PCName: string;
  "Alternate Spellings": string[];
}

const ConstituencyGame: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [correctGuesses, setCorrectGuesses] = useState<{
    [state: string]: string[];
  }>({});
  const [correctCount, setCorrectCount] = useState(0);
  const [data, setData] = useState<Constituency[]>([]);

  const formatName = (name: string) => {
    return name.toLowerCase().replace(/\band\b|\&|\s+|\-+|\\.+/g, "");
  };

  useEffect(() => {
    fetch("/constituencies_formatted.json")
      .then((response) => response.json())
      .then((loadedData) => {
        const constituencyData = loadedData as Constituency[];
        setData(constituencyData);
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
        <Table.Td style={{ width: 200 }}>{state}</Table.Td>
        <Table.Td style={{ width: 200, textAlign: "center" }}>
          {guesses.length} / {getTotalConstituenciesInState(state)}
        </Table.Td>
        <Table.Td style={{ maxWidth: 800 }}>{guesses.join(", ")}</Table.Td>
      </Table.Tr>
    ));

  return (
    <Stack
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 50,
        marginLeft: 50,
        marginRight: 50,
        marginBottom: 50,
      }}
    >
      <Image src="/emblem_of_india.svg" alt="Emblem of India" w={100} />
      <Title order={1} style={{ marginBottom: "1rem" }}>
        Guess the Lok Sabha Constituencies!
      </Title>
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
      <Stack style={{ marginTop: 20 }}>
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th style={{ width: 200 }}>State/UT</Table.Th>
              <Table.Th style={{ width: 200 }}># Correct / # Total</Table.Th>
              <Table.Th style={{ maxWidth: 800 }}>
                Constituencies Guessed
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Stack>
    </Stack>
  );
};

export default ConstituencyGame;
