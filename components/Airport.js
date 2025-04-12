import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";

const FlightUpdateScreen = ({ navigation }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const [flightNumber, setFlightNumber] = useState("");
  const [flight, setFlight] = useState({
    flightNumber: "",
    landingTime: "",
    state: "",
    terminal: "",
    airlineName: "",
    arrivalAirport: "",
    destinationAirport: "",
  });

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log("WebSocket debug: ", str),
      onConnect: (frame) => {
        console.log("STOMP connected! Frame:", frame);
        setConnected(true);
      },
      onWebSocketError: (error) => console.error("WebSocket Error: ", error),
      onStompError: (frame) =>
        console.error("STOMP Error: ", frame.headers["message"]),
    });

    setStompClient(client);
    client.activate();

    return () => {
      if (client) {
        client.deactivate();
        setConnected(false);
      }
    };
  }, []);

  const fetchFlightDetails = async () => {
    if (!flightNumber.trim()) {
      Alert.alert("Error", "Please enter a valid Flight Number");
      return;
    }

    setIsLoading(true);
    try {
      const formattedFlightNumber = flightNumber.trim().toUpperCase();
      const response = await axios.get(
        `http://localhost:8080/flights/${formattedFlightNumber}`
      );

      if (response.data) {
        setFlight(response.data);
        Alert.alert("Success", "Flight details loaded successfully");
      } else {
        Alert.alert("Error", "No flight data received");
      }
    } catch (error) {
      let errorMessage = "Failed to fetch flight details";
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = `Flight ${flightNumber} not found`;
        } else {
          errorMessage = error.response.data?.error || errorMessage;
        }
      }
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFlight((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const sendFlightUpdate = () => {
    if (!flightNumber.trim()) {
      Alert.alert("Error", "Please enter a valid Flight Number");
      return;
    }

    if (!stompClient || !connected) {
      Alert.alert("Error", "WebSocket is not connected");
      return;
    }

    try {
      const formattedFlight = {
        ...flight,
        flightNumber: flight.flightNumber.trim().toUpperCase(),
        landingTime: flight.landingTime.trim(),
      };

      stompClient.publish({
        destination: "/app/updateFlight",
        body: JSON.stringify(formattedFlight),
      });

      Alert.alert("Success", "Flight details updated successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to update flight details");
      console.error("Update error:", error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>← Back to Assignments</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Flight Update</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Flight Number (e.g., FDX6213)"
        value={flightNumber}
        onChangeText={setFlightNumber}
        autoCapitalize="characters"
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#2196F3" />
      ) : (
        <Button
          title="Fetch Flight Details"
          onPress={fetchFlightDetails}
          disabled={!flightNumber.trim()}
        />
      )}

      <TextInput
        style={styles.input}
        value={flight.flightNumber}
        onChangeText={(text) => handleInputChange("flightNumber", text)}
        placeholder="Flight Number"
        autoCapitalize="characters"
      />
      <TextInput
        style={styles.input}
        value={flight.landingTime}
        onChangeText={(text) => handleInputChange("landingTime", text)}
        placeholder="Landing Time (YYYY-MM-DD HH:MM)"
      />
      <TextInput
        style={styles.input}
        value={flight.state}
        onChangeText={(text) => handleInputChange("state", text)}
        placeholder="State"
      />
      <TextInput
        style={styles.input}
        value={flight.terminal}
        onChangeText={(text) => handleInputChange("terminal", text)}
        placeholder="Terminal"
      />
      <TextInput
        style={styles.input}
        value={flight.airlineName}
        onChangeText={(text) => handleInputChange("airlineName", text)}
        placeholder="Airline Name"
      />
      <TextInput
        style={styles.input}
        value={flight.arrivalAirport}
        onChangeText={(text) => handleInputChange("arrivalAirport", text)}
        placeholder="Arrival Airport"
      />
      <TextInput
        style={styles.input}
        value={flight.destinationAirport}
        onChangeText={(text) => handleInputChange("destinationAirport", text)}
        placeholder="Destination Airport"
      />

      <Button
        title="Submit Changes"
        onPress={sendFlightUpdate}
        disabled={!flightNumber.trim() || !connected}
      />

      {!connected && (
        <Text style={styles.warningText}>
          WebSocket is not connected. Updates may not work.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingTop: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    marginVertical: 8,
    borderRadius: 4,
    fontSize: 16,
  },
  backButton: {
    alignSelf: "flex-start",
    marginBottom: 20,
    padding: 10,
  },
  backButtonText: {
    color: "#2196F3",
    fontSize: 16,
    fontWeight: "bold",
  },
  warningText: {
    color: "red",
    textAlign: "center",
    marginTop: 10,
  },
});

export default FlightUpdateScreen;
