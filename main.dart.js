import 'package:flutter/material.dart';
import 'dart:async';
import 'dart:math';
import 'package:sensors_plus/sensors_plus.dart';
import 'package:audioplayers/audioplayers.dart';

void main() {
  runApp(MyApp());
}

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Dice App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: DiceScreen(),
    );
  }
}

class DiceScreen extends StatefulWidget {
  @override
  _DiceScreenState createState() => _DiceScreenState();
}

class _DiceScreenState extends State<DiceScreen> {
  int diceCount = 1;
  bool isVisible = true;
  List<Dice> diceList = [];
  final Random _random = Random();
  double _previousX = 0, _previousY = 0, _previousZ = 0;
  double _shakeThreshold = 15.0; // Adjust the threshold for shake detection
  StreamSubscription<AccelerometerEvent>? _accelerometerSubscription;
  bool _isShaking = false; // To prevent multiple shake events

  final AudioPlayer _audioPlayer = AudioPlayer();
  final AudioCache _audioCache = AudioCache();

  @override
  void initState() {
    super.initState();
    addDice();
    Timer.periodic(Duration(milliseconds: 50), (timer) {
      setState(() {
        diceList.forEach((dice) {
          dice.updatePosition();
          dice.handleCollision(diceList);
        });
      });
    });

    // Listen to accelerometer events
    _accelerometerSubscription = accelerometerEvents.listen((AccelerometerEvent event) {
      // Detect shake gesture based on the changes in accelerometer values
      double deltaX = (_previousX - event.x).abs();
      double deltaY = (_previousY - event.y).abs();
      double deltaZ = (_previousZ - event.z).abs();

      if (deltaX + deltaY + deltaZ > _shakeThreshold && !_isShaking) {
        _isShaking = true;
        shakeDice();
      }

      // Update previous values
      _previousX = event.x;
      _previousY = event.y;
      _previousZ = event.z;
    });
  }

  @override
  void dispose() {
    // Dispose the subscription when the widget is disposed
    _accelerometerSubscription?.cancel();
    super.dispose();
  }

  void playShakeSound() async {
    await _audioCache.play('shake_sound.mp3'); // Play the sound from assets
  }
  void shakeDice() {
    if (!_isShaking) {
      playShakeSound(); // Play the sound once when the shake begins
      _isShaking = true;
    }

    int shakeCount = 0;
    Timer.periodic(Duration(milliseconds: 50), (timer) {
      setState(() {
        diceList.forEach((dice) {
          dice.randomizeFace(); // Randomize face quickly
        });
      });
      shakeCount++;
      if (shakeCount >= 15) {
        timer.cancel();
        _isShaking = false; // Reset the shake state after finishing
      }
    });
  }


  void addDice() {
    setState(() {
      if (diceCount < 30) {
        diceCount++;
        diceList.add(Dice(
          positionX: _random.nextDouble() * 300,
          positionY: _random.nextDouble() * 500,
          velocityX: _random.nextDouble() * 4 - 2, // Random horizontal speed
          velocityY: _random.nextDouble() * 4 - 2, // Random vertical speed
        ));
      }
    });
  }

  void removeDice() {
    setState(() {
      if (diceCount > 1) {
        diceCount--;
        diceList.removeLast(); // Remove the last dice
      }
    });
  }

  void toggleVisibility() {
    setState(() {
      isVisible = !isVisible;
    });
  }

  @override
  Widget build(BuildContext context) {
    double screenWidth = MediaQuery.of(context).size.width;
    double buttonWidth = (screenWidth - 64) / 4;
    buttonWidth = buttonWidth.clamp(80, 150);
    double buttonHeight = buttonWidth * 0.5;

    return Scaffold(
      appBar: AppBar(title: Text('Dice App')),
      body: Container(
        color: Colors.grey.shade900,
        child: Stack(
          children: [
            isVisible
                ? Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  for (int i = 0; i < (diceCount / 4).ceil(); i++)
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: List.generate(
                        min(4, diceCount - i * 4),
                            (index) {
                          if (i * 4 + index < diceList.length) {
                            int diceIndex = i * 4 + index;
                            return DiceWidget(face: diceList[diceIndex].face);
                          } else {
                            return Container();
                          }
                        },
                      ),
                    ),
                ],
              ),
            )
                : Container(color: Colors.black),
            Align(
              alignment: Alignment.bottomCenter,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    buildButton(Icons.add, addDice, 'Add', buttonWidth, buttonHeight),
                    buildButton(Icons.remove, removeDice, 'Remove', buttonWidth, buttonHeight),
                    buildButton(Icons.shuffle, shakeDice, 'Shake', buttonWidth, buttonHeight),
                    buildButton(Icons.visibility, toggleVisibility, 'Visibility', buttonWidth, buttonHeight),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget buildButton(IconData icon, VoidCallback onPressed, String label, double width, double height) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8.0),
      child: ElevatedButton.icon(
        onPressed: onPressed,
        icon: Icon(
          icon,
          size: height * 0.4,
        ),
        label: Text(
          label,
          style: TextStyle(fontSize: height * 0.3),
        ),
        style: ElevatedButton.styleFrom(
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(16.0),
          ),
          padding: EdgeInsets.symmetric(horizontal: 12.0),
          minimumSize: Size(width, height),
        ),
      ),
    );
  }
}

class DiceWidget extends StatelessWidget {
  final int face;

  DiceWidget({required this.face});

  final Map<int, List<int>> dotPositions = {
    1: [4],
    2: [0, 8],
    3: [0, 4, 8],
    4: [0, 2, 6, 8],
    5: [0, 2, 4, 6, 8],
    6: [0, 2, 3, 5, 6, 8],
  };

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 60,
      height: 60,
      margin: EdgeInsets.all(8),
      decoration: BoxDecoration(
        color: Color(0xFFFFFDD0),
        borderRadius: BorderRadius.circular(8),
      ),
      child: GridView.builder(
        padding: EdgeInsets.zero,
        gridDelegate: SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          mainAxisSpacing: 2,
          crossAxisSpacing: 2,
        ),
        itemCount: 9,
        physics: NeverScrollableScrollPhysics(),
        itemBuilder: (context, index) {
          bool showDot = dotPositions[face]?.contains(index) ?? false;
          return Center(
            child: showDot
                ? Container(
              width: 10,
              height: 10,
              decoration: BoxDecoration(
                color: Colors.black,
                shape: BoxShape.circle,
              ),
            )
                : Container(),
          );
        },
      ),
    );
  }
}

class Dice {
  double positionX;
  double positionY;
  double velocityX;
  double velocityY;
  int face;

  static const double gravity = 0.1;

  Dice({
    required this.positionX,
    required this.positionY,
    required this.velocityX,
    required this.velocityY,
  }) : face = Random().nextInt(6) + 1;

  void updatePosition() {
    positionX += velocityX;
    positionY += velocityY;
    velocityY += gravity;

    if (positionX < 0 || positionX > 300) velocityX = -velocityX;
    if (positionY < 0 || positionY > 600) velocityY = -velocityY;
  }

  void randomizeFace() {
    face = Random().nextInt(6) + 1;
  }

  void handleCollision(List<Dice> diceList) {
    for (var otherDice in diceList) {
      if (otherDice != this && _distanceTo(otherDice) < 50) {
        this._bounceOff(otherDice);
      }
    }
  }

  double _distanceTo(Dice other) {
    return sqrt(pow(other.positionX - positionX, 2) + pow(other.positionY - positionY, 2));
  }

  void _bounceOff(Dice other) {
    velocityX = -velocityX;
    velocityY = -velocityY;
  }
}
