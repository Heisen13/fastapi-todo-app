import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, Switch, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from 'react-native';
import axios from 'axios';

const BASE_URL = 'https://fastapi-todo-api-hopa.onrender.com';

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

  const styles = createStyles(darkMode);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle={darkMode ? 'light-content' : 'dark-content'} />

      <Text style={styles.title}>📝 To-Do List</Text>

      <View style={styles.switchContainer}>
        <Text style={styles.label}>Dark Mode</Text>
        <Switch value={darkMode} onValueChange={toggleDarkMode} />
      </View>

      <View style={styles.filterContainer}>
        {['all', 'completed', 'pending'].map(option => (
          <TouchableOpacity key={option} onPress={() => setFilter(option)} style={[
            styles.filterButton,
            filter === option && styles.filterButtonActive
          ]}>
            <Text style={styles.filterText}>{option.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter a task..."
          placeholderTextColor={darkMode ? "#aaa" : "#555"}
          value={title}
          onChangeText={setTitle}
        />
        <Button title={editingTask ? "Update" : "Add"} onPress={handleAdd} />
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <TouchableOpacity onPress={() => handleToggleComplete(item)}>
              <Text style={[styles.taskText, item.completed && styles.completed]}>
                {item.completed ? '☑️' : '⬜'} {item.title}
              </Text>
            </TouchableOpacity>
            <View style={styles.actions}>
              <Button title="Edit" onPress={() => handleEdit(item)} />
              <Button title="Delete" color="#ff4d4d" onPress={() => handleDelete(item.id)} />
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const createStyles = (dark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: dark ? '#121212' : '#f0f0f0',
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: dark ? '#fff' : '#111',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    color: dark ? '#eee' : '#333',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  filterButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: dark ? '#333' : '#ddd',
    marginHorizontal: 5,
    borderRadius: 6,
  },
  filterButtonActive: {
    backgroundColor: '#4c9aff',
  },
  filterText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: dark ? '#2c2c2c' : '#fff',
    padding: 10,
    borderRadius: 6,
    borderColor: '#ccc',
    borderWidth: 1,
    marginRight: 10,
    color: dark ? '#fff' : '#000',
  },
  taskCard: {
    backgroundColor: dark ? '#1e1e1e' : '#fff',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  taskText: {
    fontSize: 16,
    color: dark ? '#fff' : '#000',
  },
  completed: {
    textDecorationLine: 'line-through',
    color: dark ? '#888' : '#888',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
});