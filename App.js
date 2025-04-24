import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Switch, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import axios from 'axios';

// Replace with your FastAPI backend IP
const BASE_URL = 'http://192.168.1.21:8000';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [editingTask, setEditingTask] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [filter, setFilter] = useState('all');

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/todos`);
      setTasks(res.data);
    } catch (err) {
      console.error('Error fetching tasks', err);
    }
  };

  const handleAdd = async () => {
    if (!title.trim()) return;
    try {
      if (editingTask) {
        await axios.put(`${BASE_URL}/todos/${editingTask.id}`, {
          title,
          completed: editingTask.completed,
        });
      } else {
        await axios.post(`${BASE_URL}/todos`, { title });
      }
      setTitle('');
      setEditingTask(null);
      fetchTasks();
    } catch (err) {
      console.error('Error saving task', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/todos/${id}`);
      fetchTasks();
    } catch (err) {
      console.error('Error deleting task', err);
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await axios.put(`${BASE_URL}/todos/${task.id}`, {
        title: task.title,
        completed: !task.completed,
      });
      fetchTasks();
    } catch (err) {
      console.error('Error updating task', err);
    }
  };

  const handleEdit = (task) => {
    setTitle(task.title);
    setEditingTask(task);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const filteredTasks = tasks.filter(task => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true;
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  const styles = createStyles(darkMode);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <Text style={styles.title}>To-Do List</Text>

      <View style={styles.switchContainer}>
        <Text style={styles.text}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.filterContainer}>
        {['all', 'completed', 'pending'].map(option => (
          <TouchableOpacity key={option} onPress={() => setFilter(option)}>
            <Text style={[styles.filterButton, filter === option && styles.activeFilter]}>
              {option.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Enter a task"
        placeholderTextColor={darkMode ? "#aaa" : "#555"}
        value={title}
        onChangeText={setTitle}
      />
      <Button title={editingTask ? "Update Task" : "Add Task"} onPress={handleAdd} />

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <TouchableOpacity onPress={() => handleToggleComplete(item)}>
              <Text style={[styles.taskText, item.completed && styles.completed]}>
                {item.completed ? '☑️ ' : '⬜ '} {item.title}
              </Text>
            </TouchableOpacity>
            <View style={styles.actions}>
              <Button title="Edit" onPress={() => handleEdit(item)} />
              <Button title="Delete" color="red" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (darkMode) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 30,
      paddingHorizontal: 20,
      backgroundColor: darkMode ? '#222' : '#fff',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 10,
      color: darkMode ? '#fff' : '#000',
      textAlign: 'center',
    },
    switchContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    text: {
      color: darkMode ? '#eee' : '#333',
    },
    input: {
      borderWidth: 1,
      borderColor: darkMode ? '#555' : '#ccc',
      padding: 10,
      marginBottom: 10,
      borderRadius: 5,
      color: darkMode ? '#fff' : '#000',
    },
    taskItem: {
      backgroundColor: darkMode ? '#333' : '#f9f9f9',
      padding: 15,
      marginVertical: 5,
      borderRadius: 5,
    },
    taskText: {
      fontSize: 16,
      color: darkMode ? '#fff' : '#000',
    },
    completed: {
      textDecorationLine: 'line-through',
      color: darkMode ? '#888' : '#999',
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 10,
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      marginBottom: 15,
    },
    filterButton: {
      fontWeight: 'bold',
      padding: 5,
      color: darkMode ? '#aaa' : '#333',
    },
    activeFilter: {
      color: darkMode ? '#fff' : '#000',
      textDecorationLine: 'underline',
    },
  });
