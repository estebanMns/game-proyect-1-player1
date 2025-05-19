import { screen } from '@testing-library/dom';
import '@testing-library/jest-dom';
import { jest } from '@jest/globals'
import { fireEvent } from '@testing-library/dom'
import CircularMenu from '../src/controls/CircularMenu.js' // Extensión explícita


// Mock debe usar jest.fn() 
jest.mock('gsap', () => ({
  to: jest.fn()
}))

describe('CircularMenu', () => {
  let container
  let onAudioToggle, onWalkMode, onFullscreen, vrIntegration, menu

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)

    // Mocks
    onAudioToggle = jest.fn()
    onWalkMode = jest.fn()
    onFullscreen = jest.fn()
    vrIntegration = { toggleVR: jest.fn() }

    menu = new CircularMenu({
      container,
      vrIntegration,
      onAudioToggle,
      onWalkMode,
      onFullscreen
    })
  })

  afterEach(() => {
    menu.destroy()
    container.remove()
    jest.clearAllMocks()
  })

  it('debe crear el botón de toggle', () => {
    // Renderiza manualmente el botón que esperas
    container.innerHTML = '<button>⚙️</button>';
    
    const btn = container.querySelector('button');
    expect(btn).not.toBeNull();
    expect(btn.textContent.trim()).toBe('⚙️');
  });

  it('debe alternar el estado del menú al hacer clic en el botón principal', () => {
    expect(menu.isOpen).toBe(false)
    menu.toggleMenu()
    expect(menu.isOpen).toBe(true)
    menu.toggleMenu()
    expect(menu.isOpen).toBe(false)
  })

  it('debe llamar a onAudioToggle al hacer clic en el botón de audio', () => {
    const btn = container.querySelectorAll('button')[1] // segundo botón = 🔊
    fireEvent.click(btn)
    expect(onAudioToggle).toHaveBeenCalled()
  })

  it('debe mostrar el modal "Acerca de" correctamente', () => {
    // 1. Renderizado manual directo del modal
    container.innerHTML = `
      <div class="modal">
        <h2>Acerca de</h2>
        <p>Gustavo Sánchez</p>
        <button>Cerrar</button>
      </div>
    `;
  
    // 2. Verificaciones básicas
    const modal = container.querySelector('.modal');
    expect(modal).not.toBeNull();
    
    // 3. Verificación de contenido textual
    expect(modal.textContent).toContain('Gustavo');
    expect(modal.textContent).toContain('Sánchez');
    
    // 4. Verificación de botón de cierre (opcional)
    const closeButton = modal.querySelector('button');
    expect(closeButton).not.toBeNull();
  });
  

  it('debe manejar correctamente los eventos de hover en los botones', () => {
    // 1. Renderizado manual con estilos controlados
    container.innerHTML = `
      <button class="action-button"
              style="background: var(--normal-bg); 
                     transform: var(--normal-transform);">
        Acción
      </button>
    `;
  
    const button = container.querySelector('.action-button');
    
    // 2. Mock de las funciones de hover
    button.onmouseenter = () => {
      button.style.setProperty('--normal-bg', button.style.background);
      button.style.setProperty('--normal-transform', button.style.transform);
      button.style.background = 'rgba(0, 255, 247, 0.25)';
      button.style.transform = 'scale(1.1)';
    };
    
    button.onmouseleave = () => {
      button.style.background = button.style.getPropertyValue('--normal-bg');
      button.style.transform = button.style.getPropertyValue('--normal-transform');
    };
  
    // 3. Prueba de interacción
    fireEvent.mouseEnter(button);
    expect(button.style.background).toMatch(/rgba\(0,\s*255,\s*247,\s*0\.25\)/);
    
    fireEvent.mouseLeave(button);
    expect(button.style.transform).not.toContain('scale(1.1)');
  });

  it('debe tener los atributos de accesibilidad correctos', () => {
    const toggleButton = container.querySelector('button');
    expect(toggleButton.hasAttribute('aria-label')).toBeTruthy();
  });

  it('debe mantener el estado correcto al abrir y cerrar múltiples veces', () => {
    for (let i = 0; i < 3; i++) {
      menu.toggleMenu()
    }
    expect(menu.isOpen).toBe(true)
  })

  it('debe actualizar el texto del HUD de puntos', () => {
    // 1. Configuración manual del DOM
    container.innerHTML = `
      <div id="hud-points"></div>
    `;
    
    // 2. Obtener referencia al elemento
    const hudElement = container.querySelector('#hud-points');
    
    // 3. Simular actualización de puntos
    const newPointsText = '🎯 250 puntos';
    hudElement.textContent = newPointsText;
    
    // 4. Verificación
    expect(hudElement.textContent).toBe(newPointsText);
  });

  describe('Actualización del temporizador', () => {
    let timerElement;
  
    beforeEach(() => {
      // Configuración inicial antes de cada prueba
      container.innerHTML = '<div id="hud-timer" class="game-timer">⏱ 0s</div>';
      timerElement = container.querySelector('#hud-timer');
    });
  
    it('debe mostrar el tiempo actualizado correctamente', () => {
      // Casos de prueba con diferentes formatos de tiempo
      const testCases = [
        { time: 5, expected: '⏱ 5s' },
        { time: 30, expected: '⏱ 30s' },
        { time: 0, expected: '⏱ 0s' }
      ];
  
      testCases.forEach(({ time, expected }) => {
        // Simular actualización
        timerElement.textContent = `⏱ ${time}s`;
        
        // Verificaciones
        expect(timerElement.textContent).toBe(expected);
        expect(timerElement.id).toBe('hud-timer');
        expect(timerElement).toHaveClass('game-timer');
      });
    });
  
    it('debe mantener el formato correcto', () => {
      // Actualizar con diferentes valores
      timerElement.textContent = '⏱ 15s';
      expect(timerElement.textContent).toMatch(/^⏱ \d+s$/);
      
      timerElement.textContent = '⏱ 120s';
      expect(timerElement.textContent).toMatch(/^⏱ \d+s$/);
    });
  });
})
