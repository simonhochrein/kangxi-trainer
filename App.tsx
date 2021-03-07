import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Button,
  LayoutAnimation,
  StyleSheet,
  Text,
  Touchable,
  View,
} from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import * as radicals from "./radicals.json";

function shuffle(array: any[]) {
  let copy: any[] = [];
  for (let i = 0; i < array.length; i++) {
    let newIndex = Math.round(Math.random() * (array.length - i));
    copy.splice(newIndex, 0, array[i]);
  }
  return copy;
}

function getRandomMeaning() {
  return radicals[Math.round(213 * Math.random())][3];
}

function getMeaning(index: number) {
  return radicals[index][3];
}

function getPinyin(index: number) {
  return radicals[index][4];
}

function getKangXi(index: number) {
  return String.fromCharCode(12031 + index);
}

function getRadicals() {
  let ret = [];
  for (let i = 0; i < 214; i++) {
    ret.push(i);
  }
  return ret;
}

interface Option {
  correct: boolean;
  value: string;
}

function OptionButton({
  correct,
  showAnswer,
  value,
  onPick,
  pickedAnswer,
}: {
  correct: boolean;
  showAnswer: boolean;
  value: string;
  pickedAnswer: boolean;
  onPick: (correct: boolean) => void;
}) {
  const animationValue = useRef(new Animated.Value(1)).current;
  const fadeOut = () => {
    Animated.timing(animationValue, {
      toValue: 0.4,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };
  useEffect(() => {
    if (showAnswer && !pickedAnswer && !correct) {
      fadeOut();
    } else {
      animationValue.setValue(1);
    }
  }, [showAnswer]);

  return (
    <Animated.View style={[{ opacity: animationValue }]}>
      <TouchableOpacity
        disabled={showAnswer}
        style={[
          styles.button,
          correct && showAnswer && styles.correct,
          !correct && pickedAnswer && styles.incorrect,
        ]}
        onPress={() => onPick(correct)}
      >
        <Text style={{ fontSize: 26 }}>{value}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function App() {
  const [options, setOptions] = useState<Option[]>([]);
  const [radical, setRadical] = useState("");
  const [pinyin, setPinyin] = useState("");
  const [radicals, setRadicals] = useState(getRadicals());

  const [showAnswer, setShowAnswer] = useState(false);
  const [pickedAnswer, setPickedAnswer] = useState(-1);
  const resetting = useRef(false);

  useEffect(() => {
    random();
  }, []);

  useEffect(() => {
    if (resetting.current) {
      random();
      resetting.current = false;
    }
  }, [radicals]);

  const random = () => {
    const i = Math.round(Math.random() * (radicals.length - 1));
    const index = radicals[i];
    setRadical(getKangXi(index));
    setPinyin(getPinyin(index));
    const newRadicals = [...radicals];
    newRadicals.splice(i, 1);
    setRadicals(newRadicals);

    setOptions(
      shuffle([
        { correct: true, value: getMeaning(index) },
        { correct: false, value: getRandomMeaning() },
        { correct: false, value: getRandomMeaning() },
        { correct: false, value: getRandomMeaning() },
      ])
    );
  };

  const pick = (correct: boolean, index: number) => {
    setShowAnswer(true);
    setPickedAnswer(index);
    setTimeout(() => {
      setPickedAnswer(-1);
      setShowAnswer(false);
      random();
    }, 2000);
  };
  const reset = () => {
    resetting.current = true;
    setRadicals([...getRadicals()]);
  };
  const askReset = () => {
    Alert.alert("Reset?", "", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        onPress: () => reset(),
        text: "Reset",
        style: "destructive",
      },
    ]);
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={{
          flexShrink: 1,
          paddingTop: 60,
        }}
        onPress={() => askReset()}
      >
        <Text
          style={{
            textAlign: "center",
            color: "#A0A0A0",
          }}
        >
          {214 - radicals.length}/214
        </Text>
      </TouchableOpacity>
      <View
        style={[
          styles.vbox,
          {
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
          },
        ]}
      >
        <Text style={{ fontSize: 64 }}>{radical}</Text>
        <Text style={{ fontSize: 24, marginTop: 10 }}>{pinyin}</Text>
      </View>
      <View style={styles.vbox}>
        {options.map(({ value, correct }, key) => (
          <OptionButton
            value={value}
            correct={correct}
            showAnswer={showAnswer}
            key={key}
            pickedAnswer={key == pickedAnswer}
            onPick={(correct) => pick(correct, key)}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    flexDirection: "column",
  },
  vbox: {
    flex: 1,
    paddingHorizontal: 12,
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    margin: 4,
    backgroundColor: "white",
    shadowColor: "#F0F0F0",
    shadowOpacity: 1,
    shadowRadius: 10,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
  correct: {
    backgroundColor: "#ADC865",
  },
  incorrect: {
    backgroundColor: "#E25B45",
  },
});
