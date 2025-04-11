import React, { useState, useEffect } from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Divider,
  Avatar,
  Grid,
  Paper,
  styled
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import LinkIcon from '@mui/icons-material/Link';
import CodeIcon from '@mui/icons-material/Code';
import image from '../../img/1.jpg';
import image1 from '../../img/1Q.jpeg';

import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';


import BugReportIcon from '@mui/icons-material/BugReport';
import GroupIcon from '@mui/icons-material/Group';
import GavelIcon from '@mui/icons-material/Gavel';

// Стилизованные компоненты
const GitHubBanner = styled(Paper)(({ theme }) => ({
  background: 'linear-gradient(135deg, #1f6feb 0%, #8957e5 100%)',
  borderRadius: '6px',
  padding: theme.spacing(2),
  margin: theme.spacing(2, 0),
  display: 'flex',
  alignItems: 'center',
  color: 'white'
}));

const ImagePlaceholder = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.grey[800],
  height: '200px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: '6px',
  margin: theme.spacing(2, 0),
  color: theme.palette.grey[400]
}));

const ThanksItem = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: theme.spacing(2)
}));

// Основной компонент приложения
function Dock() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('about');

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  // Список разделов меню
  const menuSections = [
    {
      title: 'Основное',
      items: [
        { id: 'about', text: 'О сервисе' },
        { id: 'features', text: 'Возможности' }
      ]
    },
    {
      title: 'Использование',
      items: [
        { id: 'quick-start', text: 'Быстрый старт' },
        { id: 'advanced', text: 'Расширенные функции' },
        { id: 'api', text: 'API интеграция' }
      ]
    },
    {
      title: 'Решение проблем',
      items: [
        { id: 'errors', text: 'Ошибки' },
        { id: 'performance', text: 'Проблемы с производительностью' }
      ]
    },
    {
      title: 'Участие',
      items: [
        { id: 'contribute', text: 'Помощь проекту' },
        { id: 'development', text: 'Для разработчиков' }
      ]
    },
    {
      title: 'Дополнительно',
      items: [
        { id: 'thanks', text: 'Благодарности' },
        { id: 'legal', text: 'Юридическая информация' }
      ]
    }
  ];

  // Боковое меню
  const drawer = (
    <Box sx={{ width: 260, height: '100vh', bgcolor: 'grey.900' }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'grey.800' }}>
        <Typography variant="h6" sx={{ color: 'primary.main' }}>Atomglide</Typography>
        <Typography variant="body2" sx={{ color: 'grey.500' }}>Документация v1.0</Typography>
      </Box>
      {menuSections.map((section) => (
        <React.Fragment key={section.title}>
          <Typography 
            variant="subtitle2" 
            sx={{ 
              px: 2, 
              py: 1, 
              mt: 2, 
              color: 'primary.main',
              textTransform: 'uppercase',
              fontSize: '0.75rem',
              letterSpacing: '0.1em'
            }}
          >
            {section.title}
          </Typography>
          <List>
            {section.items.map((item) => (
              <ListItem 
                key={item.id} 
                disablePadding
                sx={{
                  bgcolor: activeSection === item.id ? 'rgba(88, 166, 255, 0.1)' : 'transparent',
                  borderLeft: activeSection === item.id ? '3px solid' : 'none',
                  borderColor: 'primary.main'
                }}
              >
                <ListItemButton onClick={() => handleSectionChange(item.id)}>
                  <ListItemText 
                    primary={item.text} 
                    sx={{
                      '& .MuiTypography-root': {
                        color: activeSection === item.id ? 'primary.main' : 'grey.300'
                      }
                    }} 
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </React.Fragment>
      ))}
    </Box>
  );

  // Основное содержимое
  const renderContent = () => {
    switch (activeSection) {
        case 'about':
            return (
              <Box>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', borderBottom: '1px solid', borderColor: 'grey.800', pb: 1 }}>
                  О сервисе Atomglide
                </Typography>
                <Typography paragraph>
                  Atomglide - это многофункциональная социальная платформа нового поколения с уникальными возможностями для творчества и общения.
                </Typography>
                
                <GitHubBanner>
                  <AddAPhotoIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Создание контента</Typography>
                    <Typography variant="body2">
                      • Публикация постов с фото и текстом<br />
                      • Поддержка Markdown-разметки в текстах<br />
                      • Анимационные аватары и медиа<br />
                      • Сохранение медиа в избранное или скачивание
                    </Typography>
                  </Box>
                </GitHubBanner>
          
                <GitHubBanner>
                  <GroupIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Социальные функции</Typography>
                    <Typography variant="body2">
                      • Система подписок и лайков<br />
                      • Возможность делиться постами по всему миру<br />
                      • Прямые сообщения и комментарии<br />
                      • Уведомления в реальном времени
                    </Typography>
                  </Box>
                </GitHubBanner>
          
                <GitHubBanner>
                  <RocketLaunchIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Свобода творчества</Typography>
                    <Typography variant="body2">
                      • Нет ограничений на контент (кроме эротики)<br />
                      • Возможность монетизации контента<br />
                      • Гибкие настройки приватности<br />
                      • Поддержка длинных видео и подкастов
                    </Typography>
                  </Box>
                </GitHubBanner>
          
                <GitHubBanner>
                  <CodeIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">Технологии</Typography>
                    <Typography variant="body2">
                      • Отзывчивый интерфейс для любых устройств<br />
                      • Мгновенная загрузка медиа<br />
                      • Редактор постов с предпросмотром<br />
                      • API для разработчиков
                    </Typography>
                  </Box>
                </GitHubBanner>
          
                <GitHubBanner>
                  <GavelIcon sx={{ fontSize: 40, mr: 2 }} />
                  <Box>
                    <Typography variant="h6">О создателе</Typography>
                    <Typography variant="body2">
                      • Всегда на связи с пользователями<br />
                      • Быстрое реагирование на запросы<br />
                      • Открыт к предложениям по развитию<br />
                      • Лично тестирует все новые функции
                    </Typography>
                  </Box>
                </GitHubBanner>
              </Box>
            );
            case 'features':
                return (
                  <Box>
                    <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', borderBottom: '1px solid', borderColor: 'grey.800', pb: 1 }}>
                      Возможности сервиса
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {/* Контент */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <AddAPhotoIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6" sx={{ color: 'primary.main' }}>Контент</Typography>
                            </Box>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                              <li>Создание постов с фото/текстом</li>
                              <li>Markdown-разметка в текстах</li>
                              <li>Анимационные аватары</li>
                              <li>Хранение медиа до 4K качества</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Социальные */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <GroupIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6" sx={{ color: 'primary.main' }}>Социальные</Typography>
                            </Box>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                              <li>Лайки/комментарии</li>
                              <li>Подписки на авторов</li>
                              <li>Репосты с комментариями</li>
                              <li>Личные сообщения</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Медиа */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <LinkIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6" sx={{ color: 'primary.main' }}>Медиа</Typography>
                            </Box>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                              <li>Скачивание контента</li>
                              <li>Добавление в избранное</li>
                              <li>Галерея с превью</li>
                              <li>Фоновое воспроизведение</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Настройки */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <CodeIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6" sx={{ color: 'primary.main' }}>Персонализация</Typography>
                            </Box>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                              <li>Гибкие настройки приватности</li>
                              <li>Кастомизация профиля</li>
                              <li>Темная/светлая темы</li>
                              <li>Настройка уведомлений</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Технологии */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <RocketLaunchIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6" sx={{ color: 'primary.main' }}>Технологии</Typography>
                            </Box>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                              <li>Адаптивный интерфейс</li>
                              <li>Мгновенная загрузка</li>
                              <li>Оффлайн-режим</li>
                              <li>API для разработчиков</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </Grid>
                      
                      {/* Модерация */}
                      <Grid item xs={12} sm={6} md={4}>
                        <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
                          <CardContent>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <GavelIcon color="primary" sx={{ mr: 1 }} />
                              <Typography variant="h6" sx={{ color: 'primary.main' }}>Безопасность</Typography>
                            </Box>
                            <ul style={{ paddingLeft: '20px', margin: 0 }}>
                              <li>Добровольная модерация</li>
                              <li>Гибкая система жалоб</li>
                              <li>Блокировка пользователей</li>
                              <li>Шифрование данных</li>
                            </ul>
                          </CardContent>
                        </Card>
                      </Grid>
                    </Grid>
                  </Box>
                );
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', borderBottom: '1px solid', borderColor: 'grey.800', pb: 1 }}>
              Что дает Atomglide
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Автоматизация сборок
                    </Typography>
                    <Typography>
                      Настраиваемые конфигурации для разных окружений и веток разработки
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Умный деплой
                    </Typography>
                    <Typography>
                      Автоматическое развертывание с проверкой зависимостей
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Мониторинг
                    </Typography>
                    <Typography>
                      Отслеживание производительности и уведомления о проблемах
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} sm={6} md={4}>
                <Card sx={{ bgcolor: 'grey.800', height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Безопасность
                    </Typography>
                    <Typography>
                      Встроенные проверки уязвимостей зависимостей
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );
      
      case 'quick-start':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', borderBottom: '1px solid', borderColor: 'grey.800', pb: 1 }}>
              Быстрый старт
            </Typography>
            
            <Card sx={{ bgcolor: 'grey.800', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  1. Установка
                </Typography>
                <Typography paragraph>
                  Установите Atomglide CLI с помощью npm:
                </Typography>
                <Box component="pre" sx={{ 
                  bgcolor: 'grey.900', 
                  p: 2, 
                  borderRadius: 1,
                  overflowX: 'auto',
                  fontFamily: 'monospace'
                }}>
                  <code>npm install -g atomglide-cli</code>
                </Box>
                <ImagePlaceholder>
                  Скриншот установки через терминал
                </ImagePlaceholder>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: 'grey.800', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  2. Инициализация проекта
                </Typography>
                <Typography paragraph>
                  Перейдите в папку проекта и выполните:
                </Typography>
                <Box component="pre" sx={{ 
                  bgcolor: 'grey.900', 
                  p: 2, 
                  borderRadius: 1,
                  overflowX: 'auto',
                  fontFamily: 'monospace'
                }}>
                  <code>atomglide init</code>
                </Box>
                <Typography paragraph>
                  Ответьте на вопросы мастера настройки.
                </Typography>
                <ImagePlaceholder>
                  Скриншот процесса инициализации
                </ImagePlaceholder>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: 'grey.800' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  3. Запуск
                </Typography>
                <Typography paragraph>
                  Запустите сервис командой:
                </Typography>
                <Box component="pre" sx={{ 
                  bgcolor: 'grey.900', 
                  p: 2, 
                  borderRadius: 1,
                  overflowX: 'auto',
                  fontFamily: 'monospace'
                }}>
                  <code>atomglide start</code>
                </Box>
                <ImagePlaceholder>
                  Скриншот работающего сервиса
                </ImagePlaceholder>
              </CardContent>
            </Card>
          </Box>
        );
      
      case 'errors':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', borderBottom: '1px solid', borderColor: 'grey.800', pb: 1 }}>
              Частые ошибки и решения
            </Typography>
            
            <Card sx={{ bgcolor: 'grey.800', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Ошибка подключения к репозиторию
                </Typography>
                <Typography paragraph sx={{ fontWeight: 'bold' }}>
                  Симптомы:
                </Typography>
                <Typography paragraph>
                  Atomglide не может получить доступ к вашему репозиторию
                </Typography>
                <Typography paragraph sx={{ fontWeight: 'bold' }}>
                  Решение:
                </Typography>
                <ol>
                  <li>Проверьте токены доступа в настройках</li>
                  <li>Убедитесь, что у приложения есть необходимые права</li>
                  <li>Попробуйте перегенерировать токены</li>
                </ol>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: 'grey.800' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Долгая загрузка зависимостей
                </Typography>
                <Typography paragraph sx={{ fontWeight: 'bold' }}>
                  Симптомы:
                </Typography>
                <Typography paragraph>
                  Процесс установки зависимостей занимает слишком много времени
                </Typography>
                <Typography paragraph sx={{ fontWeight: 'bold' }}>
                  Решение:
                </Typography>
                <ol>
                  <li>Проверьте скорость интернет-соединения</li>
                  <li>Используйте локальный кеш зависимостей</li>
                  <li>Попробуйте альтернативные репозитории (например, для China используйте CNPM)</li>
                </ol>
              </CardContent>
            </Card>
          </Box>
        );
      
        case 'contribute':
            return (
              <Box>
                <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', borderBottom: '1px solid', borderColor: 'grey.800', pb: 1 }}>
                  Поддержать проект
                </Typography>
                
                <Card sx={{ bgcolor: 'grey.800', mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Криптовалютные переводы
                    </Typography>
                    <Typography paragraph>
                      Вы можете поддержать развитие проекта через следующие криптокошельки:
                    </Typography>
          
                    <Grid container spacing={2} sx={{ mt: 2 }}>
                      {/* Bitcoin */}
                      <Grid item xs={6} sm={4} md={3}>
                        <Card sx={{ bgcolor: 'grey.700', p: 2, textAlign: 'center' }}>
                          <Box sx={{ width: 40, height: 40, mx: 'auto', mb: 1 }}>
                            <img src="https://cryptologos.cc/logos/bitcoin-btc-logo.png" alt="Bitcoin" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Bitcoin (BTC)</Typography>
                          <Typography variant="caption" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                            3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5
                          </Typography>
                        </Card>
                      </Grid>
          
                      {/* Ethereum */}
                      <Grid item xs={6} sm={4} md={3}>
                        <Card sx={{ bgcolor: 'grey.700', p: 2, textAlign: 'center' }}>
                          <Box sx={{ width: 40, height: 40, mx: 'auto', mb: 1 }}>
                            <img src="https://cryptologos.cc/logos/ethereum-eth-logo.png" alt="Ethereum" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Ethereum (ETH)</Typography>
                          <Typography variant="caption" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                            0x71C7656EC7ab88b098defB751B7401B5f6d8976F
                          </Typography>
                        </Card>
                      </Grid>
          
                      {/* USDT */}
                      <Grid item xs={6} sm={4} md={3}>
                        <Card sx={{ bgcolor: 'grey.700', p: 2, textAlign: 'center' }}>
                          <Box sx={{ width: 40, height: 40, mx: 'auto', mb: 1 }}>
                            <img src="https://cryptologos.cc/logos/tether-usdt-logo.png" alt="USDT" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Tether (USDT)</Typography>
                          <Typography variant="caption" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                            TQrY8mutdzCEQ5FhFbQn6C7JGFQ2KnBQ6o
                          </Typography>
                        </Card>
                      </Grid>
          
                      {/* Toncoin */}
                      <Grid item xs={6} sm={4} md={3}>
                        <Card sx={{ bgcolor: 'grey.700', p: 2, textAlign: 'center' }}>
                          <Box sx={{ width: 40, height: 40, mx: 'auto', mb: 1 }}>
                            <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="Toncoin" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>Toncoin (TON)</Typography>
                          <Typography variant="caption" sx={{ wordBreak: 'break-all', fontFamily: 'monospace' }}>
                            EQCD39VS5jcptHL8vMjEXrzGaRcCVYto7HUn4bpAOg8xYRAy
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
          
                <Card sx={{ bgcolor: 'grey.800', mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Традиционные способы
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ bgcolor: 'grey.700', p: 2 }}>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>GitHub Sponsors</Typography>
                          <Typography variant="body2">
                            Подписка с ежемесячной поддержкой проекта
                          </Typography>
                        </Card>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Card sx={{ bgcolor: 'grey.700', p: 2 }}>
                          <Typography variant="subtitle1" sx={{ mb: 1 }}>Patreon</Typography>
                          <Typography variant="body2">
                            Эксклюзивный контент для спонсоров
                          </Typography>
                        </Card>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
          
                <Card sx={{ bgcolor: 'grey.800' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                      Другие способы помочь
                    </Typography>
                    <ul>
                      <li>Сообщать о найденных ошибках</li>
                      <li>Предлагать новые функции</li>
                      <li>Делиться проектом в соцсетях</li>
                      <li>Участвовать в разработке</li>
                    </ul>
                  </CardContent>
                </Card>
              </Box>
            );
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', borderBottom: '1px solid', borderColor: 'grey.800', pb: 1 }}>
              Помощь проекту
            </Typography>
            
            <Card sx={{ bgcolor: 'grey.800', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Присоединяйтесь к разработке
                </Typography>
                <Typography paragraph>
                  Atomglide - проект с открытым исходным кодом. Мы приветствуем любые вклады:
                </Typography>
                
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ bgcolor: 'grey.700', height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle1">Разработка</Typography>
                        </Box>
                        <Typography variant="body2">
                          Присылайте pull requests с исправлениями и новыми функциями
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ bgcolor: 'grey.700', height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CodeIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle1">Документация</Typography>
                        </Box>
                        <Typography variant="body2">
                          Помогите улучшить документацию и переводы
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={4}>
                    <Card sx={{ bgcolor: 'grey.700', height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <BugReportIcon sx={{ mr: 1, color: 'primary.main' }} />
                          <Typography variant="subtitle1">Тестирование</Typography>
                        </Box>
                        <Typography variant="body2">
                          Сообщайте о багах и тестируйте новые версии
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                
                <Typography paragraph>
                  Как начать:
                </Typography>
                <Box component="pre" sx={{ 
                  bgcolor: 'grey.900', 
                  p: 2, 
                  borderRadius: 1,
                  overflowX: 'auto',
                  fontFamily: 'monospace'
                }}>
                  <code>{`git clone https://github.com/atomglide/core.git
cd core
npm install
npm run dev`}</code>
                </Box>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: 'grey.800' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Финансовая поддержка
                </Typography>
                <Typography paragraph>
                  Вы можете поддержать проект через:
                </Typography>
                <ul>
                  <li>GitHub Sponsors</li>
                  <li>OpenCollective</li>
                  <li>Patreon</li>
                </ul>
              </CardContent>
            </Card>
          </Box>
        );
      
      case 'thanks':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', borderBottom: '1px solid', borderColor: 'grey.800', pb: 1 }}>
              Благодарности
            </Typography>
            
            <Card sx={{ bgcolor: 'grey.800', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Основные контрибьюторы
                </Typography>
                
                <ThanksItem>
                  <Avatar sx={{ bgcolor: 'grey.700', width: 56, height: 56, mr: 2 }} src={image}>JD</Avatar>
                  <Box>
                    <Typography variant="subtitle1">Dmitry Khorov</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Ведущий разработчик, Back-end и Front-end разработчик
                    </Typography>
                  </Box>
                </ThanksItem>
                
                <ThanksItem>
                  <Avatar sx={{ bgcolor: 'grey.700', width: 56, height: 56, mr: 2 }} src={image1}>AS</Avatar>
                  <Box>
                    <Typography variant="subtitle1">Александр Лукин</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Дизайнер формы регистарции и входа в аккаунт 
                    </Typography>
                  </Box>
                </ThanksItem>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: 'grey.800' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Специальная благодарность
                </Typography>
                <ul>
                  <li>Команде GitHub за вдохновение</li>
                  <li>Сообществу Open Source за бесценный опыт</li>
                  <li>Всем тестерам и пользователям за фидбек</li>
                </ul>
              </CardContent>
            </Card>
          </Box>
        );
      
      case 'legal':
        return (
          <Box>
            <Typography variant="h4" gutterBottom sx={{ color: 'primary.main', borderBottom: '1px solid', borderColor: 'grey.800', pb: 1 }}>
              Юридическая информация
            </Typography>
            
            <Card sx={{ bgcolor: 'grey.800', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Лицензия
                </Typography>
                <Typography paragraph>
                  Atomglide распространяется под лицензией MIT.
                </Typography>
                <Typography>
                  Полный текст лицензии доступен в репозитории проекта.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: 'grey.800', mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Политика конфиденциальности
                </Typography>
                <Typography paragraph>
                  Мы собираем только необходимые данные для работы сервиса и улучшения пользовательского опыта.
                </Typography>
                <Typography>
                  Мы никогда не продаем и не передаем ваши данные третьим лицам.
                </Typography>
              </CardContent>
            </Card>
            
            <Card sx={{ bgcolor: 'grey.800' }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ color: 'primary.main' }}>
                  Товарные знаки
                </Typography>
                <Typography paragraph>
                  Atomglide является зарегистрированным товарным знаком Atomglide Inc.
                </Typography>
                <Typography>
                  GitHub является зарегистрированным товарным знаком GitHub, Inc.
                </Typography>
              </CardContent>
            </Card>
          </Box>
        );
      
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', bgcolor: 'grey.900', minHeight: '100vh' }}>
      {/* Кнопка меню для мобильных */}
      <IconButton
        color="inherit"
        aria-label="open drawer"
        edge="start"
        onClick={handleDrawerToggle}
        sx={{ 
          position: 'fixed',
          top: 16,
          left: 16,
          zIndex: theme.zIndex.drawer + 1,
          display: { xs: 'block', md: 'none' },
          color: 'grey.300'
        }}
      >
        <MenuIcon />
      </IconButton>
      
      {/* Боковое меню */}
      <Box
        component="nav"
        sx={{ 
          width: { md: 260 },
          flexShrink: { md: 0 }
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              width: 260,
              bgcolor: 'grey.900'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box',
              width: 260,
              bgcolor: 'grey.900',
              borderRight: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      
      {/* Основное содержимое */}
      <Box
        component="main"
        sx={{ 
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - 260px)` },
          maxWidth: 1200,
          margin: '0 auto'
        }}
      >
        <Box sx={{ 
          pt: { xs: 6, md: 3 },
          pb: 3
        }}>
          {renderContent()}
        </Box>
      </Box>
    </Box>
  );
}

export default Dock;