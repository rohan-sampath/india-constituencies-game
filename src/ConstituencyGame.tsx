import React, { useState, useEffect } from "react";
import { TextInput, Image, Title, Stack, Table } from "@mantine/core";

interface Constituency {
  "State/UT": string;
  PCName: string;
}

const ConstituencyGame: React.FC = () => {
  const [input, setInput] = useState<string>("");
  const [formattedConstituencies, setFormattedConstituencies] = useState<
    string[]
  >([]);
  const [regularConstituencies, setRegularConstituencies] = useState<string[]>(
    []
  );
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
        const formattedList = constituencyData.map((c) => formatName(c.PCName));
        const regularList = constituencyData.map((c) => c.PCName);
        setFormattedConstituencies(formattedList);
        setRegularConstituencies(regularList);
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

    // First, determine all new guesses and prepare updated state
    formattedConstituencies.forEach((constituency, index) => {
      if (constituency === formattedInput) {
        const state = data[index]["State/UT"];
        const constituencyName = regularConstituencies[index];
        const guessesForState = correctGuesses[state] || [];

        if (!guessesForState.includes(constituencyName)) {
          newGuesses += 1;
          updatedGuesses[state] = [...guessesForState, constituencyName];
        } else {
          updatedGuesses[state] = [...guessesForState];
        }
      }
    });

    // Now, if there are new guesses, update the states once
    if (newGuesses > 0) {
      setCorrectGuesses((prev) => ({
        ...prev,
        ...updatedGuesses,
      }));
      setCorrectCount((prevCount) => prevCount + newGuesses);
      setInput("");
    }
  }, [
    input,
    formattedConstituencies,
    correctGuesses,
    regularConstituencies,
    data,
  ]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newInput = event.currentTarget.value;
    setInput(newInput);
  };

  const rows = Object.entries(correctGuesses)
    .sort(([stateA], [stateB]) => stateA.localeCompare(stateB))
    .map(([state, guesses]) => (
      <tr key={state}>
        <td>{state}</td>
        <td>{guesses.length}</td>
        <td>{guesses.join(", ")}</td>
      </tr>
    ));

  return (
    <Stack
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center", // Optional, if you also want vertical centering
        marginTop: 50,
        marginLeft: 50,
        marginRight: 50,
        marginBottom: 50,
      }}
    >
      <Image src="/emblem_of_india.svg" alt="Emblem of India" w={100} />
      <Title order={1} style={{ marginBottom: "1rem" }}>
        Guess the Lok Sabha Constituencies Game
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
      <Title order={3}>
        Correctly Guessed Constituencies: {correctCount} / 543
      </Title>
      <Stack style={{ marginTop: 20 }}>
        <Table>
          <thead>
            <tr>
              <th>State/UT</th>
              <th># of Correct Guesses</th>
              <th>Constituencies Guessed</th>
            </tr>
          </thead>
          <tbody>{rows}</tbody>
        </Table>
      </Stack>
    </Stack>
  );
};

export default ConstituencyGame;
