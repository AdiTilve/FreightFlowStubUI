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
} from "react-native";
import { Client } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import axios from "axios";

const GreetingScreen = ({ navigation }) => {
  // Added navigation prop
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [stompClient, setStompClient] = useState(null);
  const [assignmentNumber, setAssignmentNumber] = useState("");
  const [assignment, setAssignment] = useState({
    assignmentNumber: "",
    flightNumber: "",
    cargoType: "",
    priorityLevel: "",
    assignmentType: "",
    assignmentStatus: "",
    flightStatus: "",
  });
  const [newObject, setNewObject] = useState({
    assignmentNumber: "123",
    flightNumber: "FX801",
  });

  useEffect(() => {
    const socket = new SockJS("http://localhost:8080/ws");
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => {
        console.log("WebSocket debug: ", str);
      },
      onConnect: (frame) => {
        console.log("STOMP connected! Frame:", frame);
        setConnected(true);
      },
      onWebSocketError: (error) => {
        console.error("WebSocket Error: ", error);
      },
      onStompError: (frame) => {
        console.error("STOMP Error: ", frame.headers["message"]);
      },
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

  const fetchAssignmentDetails = () => {
    console.log(assignmentNumber);
    axios
      .get(`http://localhost:8080/api/assignments/${assignmentNumber}`)
      .then((response) => {
        console.log("Assignment details:", response.data);
        setAssignment(response.data);
      })
      .catch((error) => {
        if (error.response) {
          console.log("Error response data:", error.response.data);
          console.log("Error response status:", error.response.status);
          alert(`Error: ${error.response.data}`);
        } else if (error.request) {
          console.error("Error request:", error.request);
        } else {
          console.error("Error message:", error.message);
        }
      });
  };

  const handleInputChange = (field, value) => {
    console.log(`Field: ${field}, Value: ${value}`);

    switch (field) {
      case "flightNumber":
        setAssignment({
          ...assignment,
          flightNumber: value,
        });
        break;
      case "cargoType":
        setAssignment({
          ...assignment,
          cargoType: value,
        });
        break;
      case "priorityLevel":
        setAssignment({
          ...assignment,
          priorityLevel: value,
        });
        break;
      case "assignmentType":
        setAssignment({
          ...assignment,
          assignmentType: value,
        });
        break;
      case "assignmentStatus":
        setAssignment({
          ...assignment,
          assignmentStatus: value,
        });
        break;
      default:
        console.log("Field does not match any case");
        break;
    }
  };

  const sendMessage = () => {
    if (!assignmentNumber) {
      Alert.alert("Error", "Please enter a valid Assignment ID");
      return;
    }
    var flightNumber = "FX801";
    console.log("Sending assignment:", assignmentNumber, flightNumber);
    if (stompClient && connected) {
      stompClient.publish({
        destination: "/app/application",
        body: JSON.stringify({
          assignmentNumber: assignment.assignmentNumber,
          flightNumber: assignment.flightNumber,
          cargoType: assignment.cargoType,
          priorityLevel: assignment.priorityLevel,
          assignmentType: assignment.assignmentType,
          assignmentStatus: assignment.assignmentStatus,
          flightStatus: assignment.flightStatus,
        }),
      });
      setMessage("");
    } else {
      Alert.alert("Error", "WebSocket is not connected");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Assignment Update</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter Assignment ID"
        value={assignmentNumber}
        onChangeText={(text) => setAssignmentNumber(text)}
      />
      <Button
        title="Fetch Assignment Details"
        onPress={fetchAssignmentDetails}
      />

      <TextInput
        style={styles.input}
        value={assignment.flightNumber}
        onChangeText={(text) => handleInputChange("flightNumber", text)}
        placeholder="Flight Number"
      />
      <TextInput
        style={styles.input}
        value={assignment.cargoType}
        onChangeText={(text) => handleInputChange("cargoType", text)}
        placeholder="Cargo Type"
      />
      <TextInput
        style={styles.input}
        value={assignment.priorityLevel}
        onChangeText={(text) => handleInputChange("priorityLevel", text)}
        placeholder="Priority Level"
      />
      <TextInput
        style={styles.input}
        value={assignment.assignmentType}
        onChangeText={(text) => handleInputChange("assignmentType", text)}
        placeholder="Assignment Type"
      />
      <TextInput
        style={styles.input}
        value={assignment.assignmentStatus}
        onChangeText={(text) => handleInputChange("assignmentStatus", text)}
        placeholder="Status"
      />

      <Button title="Submit Changes" onPress={sendMessage} />

      {/* Add Flight Update Button */}
      <TouchableOpacity
        style={styles.flightButton}
        onPress={() => navigation.navigate("FlightUpdateScreen")}
      >
        <Text style={styles.flightButtonText}>Update Flight Details</Text>
      </TouchableOpacity>

      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => <Text style={styles.message}>{item}</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
    paddingTop: 100,
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
    padding: 8,
    marginVertical: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  updateMessage: {
    marginTop: 20,
    fontSize: 16,
    color: "green",
    textAlign: "center",
  },
  flightButton: {
    backgroundColor: "#2196F3",
    padding: 10,
    borderRadius: 5,
    marginTop: 20,
    alignItems: "center",
  },
  flightButtonText: {
    color: "white",
    fontWeight: "bold",
  },
  message: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});

export default GreetingScreen;
