import matplotlib.pyplot as plt
import numpy as np
import sys

def main():
    director()



def director():
    decision = input('1. sound | 2. wavemake | 3. interference | 4. light: ')
    if '1' in decision:
        sound()
    if '2' in decision:
        wavemake()
    if '3' in decision:
        interference()
    if '4' in decision:
        light()

def sound(): # bølgeformel: v = f*λ
    print('v = f*λ')
    calcfor = input('calc for: 1. f (Hz) | 2. v (wave velocity) | 3. λ (wavelength) | 4. T (period): ')
    if '1' in calcfor:
        fform = input('do you know T? y/n: ')
        if 'n' in fform:      
            print('f = v/λ')
            v = float(input('v = '))
            λ = float(input('λ = '))
            print(f'f = {v}/{λ}')
            res = v / λ
            print(f'{res} Hz')
            main()
        if 'y' in fform:
            print('f = 1/T')
            T = float(input('T = '))
            print(f'f = 1/{T}')
            res = 1/T
            print(f'{res} Hz')
            main()
        else:
            sys.exit(0)
    if '2' in calcfor:
        print('v = f*λ')
        f = float(input('f = '))
        λ = float(input('λ = '))
        print(f'v = {f}/{λ}')
        res = f * λ
        print(f'{res} m/s')
        main()
    if '3' in calcfor:
        print('λ = v/f')
        v = float(input('v = '))
        f = float(input('f = '))
        print(f'λ = {v}/{f}')
        res = v / f
        print(f'{res} m')
        main()
    if '4' in calcfor:
        print('Time from wavetop to wavetop ')
        print('T = 1/f')
        f = float(input('f = '))
        res = 1 / f
        print(f'f = 1/{f}')
        print(f'{res} s')
        main()

def interference(): #interference calculation
    ...
def light():
    print('light is fotons but can also be describet as linear parallel waves.')
    print('just like sound waves and waterwaves light still has properties like wavelength, frequency and amplitude. ')
    choice = input('1. intefererence | 2. electromagnetic radiation | 3. heatradiation | 4. electromagnetic radiationenergy: ')
    if '1' in choice:
        print('calculate for sin of θ or θn')
        interferencechoice = input('1. sin θ = λ/d | 2. sinθn= (n*λ)/d | calc for orders: 3. n ≤ d/λ: ')
        if '1' in interferencechoice:
            λ = float(input('λ = '))
            d = float(input('d in m = '))
            res = λ / d
            print(f'sin θ = {λ}/{d}')
            print(f'{res}°')
            main()
        if '2' in interferencechoice:
            λ = float(input('λ = '))
            d = float(input('d in m = '))
            n = float(input('n = '))
            res = (n*λ) / d
            print(f'sin θn = {n}*{λ}/{d}')
            print(f'{res}°')
            main()
        if '3' in interferencechoice:
            print('n ≤ d/λ:')
            d = float(input('d in m = '))           
            λ = float(input('λ = '))
            res = d / λ
            print(f'n ≤ {d}/{λ}')
            print(res)                       
def wavemake():
    amplitude = float(input('amplitude = '))
    frequency = float(input('f = '))
    period = float(input('T = '))

    sampling_rate = 44100
    print(period, frequency, amplitude)

    t = np.linspace(0, period, int(period * sampling_rate), endpoint=False)
    sine_wave = amplitude * np.sin(2 * np.pi * frequency * t)
    plt.plot(t, sine_wave)
    plt.xlabel('Time (s)')
    plt.ylabel('Amplitude')
    plt.show()
    main()



if __name__ == "__main__":
    main()

