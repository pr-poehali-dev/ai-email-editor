import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: string;
  name: string;
  slug: string;
  date: string;
  program: string;
  speakers: string;
  pains: string;
  ragLinks: string;
  htmlTemplate: string;
}

interface EmailOutput {
  subject: string;
  preheader: string;
  headline: string;
  intro: string;
  pain_point?: string;
  value_proposition: string;
  agenda_block?: string;
  speakers_block?: string;
  offer: string;
  cta_text: string;
  cta_url: string;
  utm_params: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
  };
  errors: Array<{ slot: string; reason: string }>;
}

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('events');
  
  const [events, setEvents] = useState<Event[]>([
    {
      id: '1',
      name: 'AI Conference 2024',
      slug: 'ai-conf-2024',
      date: '15 декабря 2024',
      program: 'Keynote: Будущее ИИ (10:00), Воркшоп: Практика ML (14:00), Панель: Этика ИИ (16:00)',
      speakers: 'Анна Петрова (CEO AI Labs), Дмитрий Смирнов (ML Engineer Google), Елена Иванова (Data Scientist)',
      pains: 'Сложно внедрить ИИ в бизнес, нехватка данных для обучения моделей, высокая стоимость инфраструктуры',
      ragLinks: '',
      htmlTemplate: ''
    }
  ]);

  const [currentEvent, setCurrentEvent] = useState<Partial<Event>>({
    name: '',
    slug: '',
    date: '',
    program: '',
    speakers: '',
    pains: '',
    ragLinks: '',
    htmlTemplate: ''
  });

  const [contentType, setContentType] = useState<string>('announce');
  const [topic, setTopic] = useState<string>('');
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [generatedEmail, setGeneratedEmail] = useState<EmailOutput | null>(null);

  const contentTypes = [
    { value: 'announce', label: 'Анонс', description: 'Новизна + ценность, мягкий CTA' },
    { value: 'sale', label: 'Продажа', description: 'Выгоды + доказательства + дедлайн' },
    { value: 'pain_sale', label: 'Боль → Решение', description: 'Цепочка боль-усугубление-решение' },
    { value: 'reminder', label: 'Напоминание', description: 'Кратко: когда/где/что упустит' },
    { value: 'digest', label: 'Дайджест', description: '3-5 пунктов пользы' }
  ];

  const handleAddEvent = () => {
    if (!currentEvent.name || !currentEvent.slug) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и slug события',
        variant: 'destructive'
      });
      return;
    }

    const newEvent: Event = {
      id: Date.now().toString(),
      name: currentEvent.name,
      slug: currentEvent.slug,
      date: currentEvent.date || '',
      program: currentEvent.program || '',
      speakers: currentEvent.speakers || '',
      pains: currentEvent.pains || '',
      ragLinks: currentEvent.ragLinks || '',
      htmlTemplate: currentEvent.htmlTemplate || ''
    };

    setEvents([...events, newEvent]);
    setCurrentEvent({ name: '', slug: '', date: '', program: '', speakers: '', pains: '', ragLinks: '', htmlTemplate: '' });
    
    toast({
      title: 'Событие добавлено',
      description: `${newEvent.name} успешно создано`
    });
  };

  const generateEmail = () => {
    if (!selectedEventId) {
      toast({
        title: 'Ошибка',
        description: 'Выберите событие',
        variant: 'destructive'
      });
      return;
    }

    const event = events.find(e => e.id === selectedEventId);
    if (!event) return;

    const errors: Array<{ slot: string; reason: string }> = [];
    
    if (!event.program) {
      errors.push({ slot: 'program', reason: 'missing_required_fact' });
    }

    let subject = '';
    let preheader = '';
    let headline = '';
    let intro = '';
    let pain_point = undefined;
    let value_proposition = '';
    let offer = '';
    let cta_text = '';

    switch (contentType) {
      case 'announce':
        subject = `${event.name} — ${event.date}`;
        preheader = `Открыта регистрация на главное событие года`;
        headline = `${event.name} уже скоро`;
        intro = `Приглашаем вас на ${event.name}, который пройдёт ${event.date}. Ведущие эксперты отрасли поделятся знаниями и опытом.`;
        value_proposition = `Программа включает: ${event.program.split(',').slice(0, 2).join(',')}`;
        offer = 'Зарегистрируйтесь сейчас и получите доступ ко всем материалам';
        cta_text = 'Зарегистрироваться';
        break;

      case 'sale':
        subject = `Скидка 30% на ${event.name} до ${event.date}`;
        preheader = `Последние дни специального предложения`;
        headline = `Успейте купить билет со скидкой`;
        intro = `${event.name} — это уникальная возможность получить знания от лучших экспертов.`;
        value_proposition = `Вы получите: доступ к ${event.program.split(',').length} секциям, нетворкинг с ${event.speakers.split(',').length} спикерами, записи всех выступлений`;
        offer = 'Специальная цена действует только до конца недели';
        cta_text = 'Купить билет со скидкой';
        break;

      case 'pain_sale':
        subject = `Решение для ${event.pains.split(',')[0]}`;
        preheader = `Узнайте, как преодолеть главные вызовы`;
        headline = `Знакомо?`;
        intro = `Многие сталкиваются с проблемой: ${event.pains.split(',')[0]}.`;
        pain_point = `Без правильного подхода это приводит к потере времени и денег. Каждый день промедления стоит дорого.`;
        value_proposition = `На ${event.name} вы узнаете проверенные решения от экспертов, которые уже прошли этот путь`;
        offer = `Зарегистрируйтесь до ${event.date} и получите бонусные материалы`;
        cta_text = 'Получить решение';
        break;

      case 'reminder':
        subject = `Завтра ${event.name}!`;
        preheader = `Не пропустите старт события`;
        headline = `Встречаемся завтра`;
        intro = `Напоминаем: ${event.name} стартует ${event.date}. Проверьте свою регистрацию.`;
        value_proposition = `В программе: ${event.program.split(',').slice(0, 3).join(', ')}`;
        offer = 'Подключайтесь вовремя, чтобы не упустить важное';
        cta_text = 'Перейти к событию';
        break;

      case 'digest':
        subject = `5 ключевых тем ${event.name}`;
        preheader = `Обзор главных инсайтов события`;
        headline = `Главное с ${event.name}`;
        intro = `Собрали для вас ключевые выводы и идеи с события.`;
        value_proposition = `• ${event.program.split(',').slice(0, 3).map(p => p.trim()).join('\n• ')}`;
        offer = 'Скачайте полную запись и материалы';
        cta_text = 'Получить материалы';
        break;
    }

    const output: EmailOutput = {
      subject: subject.slice(0, 55),
      preheader: preheader.slice(0, 70),
      headline,
      intro,
      pain_point,
      value_proposition,
      agenda_block: event.program,
      speakers_block: event.speakers,
      offer,
      cta_text,
      cta_url: `https://example.com/events/${event.slug}`,
      utm_params: {
        utm_source: 'email',
        utm_medium: 'newsletter',
        utm_campaign: event.slug,
        utm_content: contentType
      },
      errors
    };

    setGeneratedEmail(output);
    
    toast({
      title: 'Письмо сгенерировано',
      description: errors.length > 0 ? `Найдено ошибок: ${errors.length}` : 'Успешно'
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Mail" className="text-primary-foreground" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AI Email Editor</h1>
              <p className="text-sm text-muted-foreground">Генератор писем для мероприятий</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="events" className="gap-2">
              <Icon name="Calendar" size={16} />
              События
            </TabsTrigger>
            <TabsTrigger value="generate" className="gap-2">
              <Icon name="Sparkles" size={16} />
              Генератор
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-2">
              <Icon name="Settings" size={16} />
              Настройки
            </TabsTrigger>
          </TabsList>

          <TabsContent value="events" className="space-y-6 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Plus" size={20} />
                    Создать событие
                  </CardTitle>
                  <CardDescription>Добавьте информацию о мероприятии</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-name">Название события</Label>
                    <Input
                      id="event-name"
                      value={currentEvent.name}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, name: e.target.value })}
                      placeholder="AI Conference 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-slug">Slug (URL)</Label>
                    <Input
                      id="event-slug"
                      value={currentEvent.slug}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, slug: e.target.value })}
                      placeholder="ai-conf-2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-date">Дата</Label>
                    <Input
                      id="event-date"
                      value={currentEvent.date}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, date: e.target.value })}
                      placeholder="15 декабря 2024"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-program">Программа</Label>
                    <Textarea
                      id="event-program"
                      value={currentEvent.program}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, program: e.target.value })}
                      placeholder="Keynote: Тема (10:00), Воркшоп: Практика (14:00)"
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-speakers">Спикеры</Label>
                    <Textarea
                      id="event-speakers"
                      value={currentEvent.speakers}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, speakers: e.target.value })}
                      placeholder="Имя Фамилия (Должность Компания), ..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-pains">Боли аудитории</Label>
                    <Textarea
                      id="event-pains"
                      value={currentEvent.pains}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, pains: e.target.value })}
                      placeholder="Проблема 1, Проблема 2, ..."
                      rows={2}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label htmlFor="event-rag" className="flex items-center gap-2">
                      <Icon name="Link" size={16} />
                      RAG ссылки (Google Docs/Sheets)
                    </Label>
                    <Textarea
                      id="event-rag"
                      value={currentEvent.ragLinks}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, ragLinks: e.target.value })}
                      placeholder="https://docs.google.com/document/d/..., https://docs.google.com/spreadsheets/d/..."
                      rows={2}
                    />
                    <p className="text-xs text-muted-foreground">Ссылки на документы для индексации знаний (через запятую)</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="event-template" className="flex items-center gap-2">
                      <Icon name="Code" size={16} />
                      HTML-шаблон письма
                    </Label>
                    <Textarea
                      id="event-template"
                      value={currentEvent.htmlTemplate}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, htmlTemplate: e.target.value })}
                      placeholder="<html>...<!--IF:pain_point-->{{pain_point}}<!--ENDIF-->...</html>"
                      rows={4}
                      className="font-mono text-xs"
                    />
                    <p className="text-xs text-muted-foreground">Шаблон с плейсхолдерами {'{'}{'{'} field {'}'}{'}'}  и условными блоками {'<'}!--IF:xxx--{'>'}</p>
                  </div>

                  <Button onClick={handleAddEvent} className="w-full gap-2">
                    <Icon name="Plus" size={16} />
                    Добавить событие
                  </Button>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Icon name="ListChecks" size={20} />
                  Список событий
                </h2>
                {events.length === 0 ? (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <Icon name="Calendar" size={48} className="mx-auto mb-4 opacity-20" />
                      <p>События не добавлены</p>
                    </CardContent>
                  </Card>
                ) : (
                  events.map((event) => (
                    <Card key={event.id} className="animate-scale-in hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-base">{event.name}</CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1">
                              <Icon name="Calendar" size={14} />
                              {event.date || 'Дата не указана'}
                            </CardDescription>
                          </div>
                          <Badge variant="secondary">{event.slug}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        {event.program && (
                          <div>
                            <span className="font-medium text-muted-foreground">Программа:</span>
                            <p className="text-foreground mt-1">{event.program.slice(0, 100)}...</p>
                          </div>
                        )}
                        {event.ragLinks && (
                          <div>
                            <span className="font-medium text-muted-foreground flex items-center gap-1">
                              <Icon name="Link" size={14} />
                              RAG ссылки:
                            </span>
                            <p className="text-foreground mt-1 text-xs break-all">{event.ragLinks.slice(0, 80)}...</p>
                          </div>
                        )}
                        {event.htmlTemplate && (
                          <div>
                            <Badge variant="outline" className="gap-1">
                              <Icon name="Code" size={12} />
                              Шаблон загружен
                            </Badge>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="generate" className="space-y-6 animate-fade-in">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="Wand2" size={20} />
                    Параметры генерации
                  </CardTitle>
                  <CardDescription>Настройте параметры письма</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="select-event">Выберите событие</Label>
                    <Select value={selectedEventId} onValueChange={setSelectedEventId}>
                      <SelectTrigger id="select-event">
                        <SelectValue placeholder="Выберите событие" />
                      </SelectTrigger>
                      <SelectContent>
                        {events.map((event) => (
                          <SelectItem key={event.id} value={event.id}>
                            {event.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="content-type">Тип контента</Label>
                    <Select value={contentType} onValueChange={setContentType}>
                      <SelectTrigger id="content-type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {contentTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      {contentTypes.find(t => t.value === contentType)?.description}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="topic">Тема (опционально)</Label>
                    <Input
                      id="topic"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="Дополнительная тема"
                    />
                  </div>

                  <Separator />

                  <Button onClick={generateEmail} className="w-full gap-2" size="lg">
                    <Icon name="Sparkles" size={18} />
                    Сгенерировать письмо
                  </Button>
                </CardContent>
              </Card>

              <Card className="animate-scale-in">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon name="FileJson" size={20} />
                    Результат
                  </CardTitle>
                  <CardDescription>JSON для шаблона</CardDescription>
                </CardHeader>
                <CardContent>
                  {generatedEmail ? (
                    <div className="space-y-4">
                      {generatedEmail.errors.length > 0 && (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                          <p className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                            <Icon name="AlertTriangle" size={16} />
                            Ошибки валидации:
                          </p>
                          {generatedEmail.errors.map((err, idx) => (
                            <p key={idx} className="text-xs text-destructive/90">
                              • {err.slot}: {err.reason}
                            </p>
                          ))}
                        </div>
                      )}

                      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Subject</p>
                          <p className="text-sm font-medium">{generatedEmail.subject}</p>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Preheader</p>
                          <p className="text-sm">{generatedEmail.preheader}</p>
                        </div>
                        <Separator />
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Headline</p>
                          <p className="text-sm font-semibold">{generatedEmail.headline}</p>
                        </div>
                      </div>

                      <div className="bg-secondary/30 rounded-lg p-3 max-h-96 overflow-y-auto">
                        <pre className="text-xs font-mono whitespace-pre-wrap break-words">
                          {JSON.stringify(generatedEmail, null, 2)}
                        </pre>
                      </div>

                      <Button variant="outline" className="w-full gap-2" onClick={() => {
                        navigator.clipboard.writeText(JSON.stringify(generatedEmail, null, 2));
                        toast({ title: 'Скопировано', description: 'JSON скопирован в буфер обмена' });
                      }}>
                        <Icon name="Copy" size={16} />
                        Копировать JSON
                      </Button>
                    </div>
                  ) : (
                    <div className="py-12 text-center text-muted-foreground">
                      <Icon name="FileJson" size={48} className="mx-auto mb-4 opacity-20" />
                      <p>Сгенерируйте письмо</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="animate-fade-in">
            <Card className="max-w-2xl mx-auto animate-scale-in">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="Settings" size={20} />
                  Настройки
                </CardTitle>
                <CardDescription>Конфигурация валидации и UTM</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Icon name="CheckCircle" size={18} />
                    Правила валидации
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm">
                    <p>• Subject: максимум 55 символов</p>
                    <p>• Preheader: 35-70 символов</p>
                    <p>• Один основной CTA с валидным URL</p>
                    <p>• Agenda/speakers соответствуют RAG</p>
                    <p>• Без заглушек при нехватке данных</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Icon name="Link" size={18} />
                    Типы контента
                  </h3>
                  <div className="space-y-3">
                    {contentTypes.map((type) => (
                      <div key={type.value} className="bg-card border rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline">{type.label}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{type.description}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="font-medium flex items-center gap-2">
                    <Icon name="Tag" size={18} />
                    UTM параметры
                  </h3>
                  <div className="bg-muted/50 rounded-lg p-4 space-y-2 text-sm font-mono">
                    <p>utm_source: email</p>
                    <p>utm_medium: newsletter</p>
                    <p>utm_campaign: {'{event_slug}'}</p>
                    <p>utm_content: {'{contentType}'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Index;