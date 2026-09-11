'use client';

import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';

const questions = [
  ['Можно прийти без команды?', 'Да, в этом и идея RentZal. Ты бронируешь отдельное место в игре и присоединяешься к другим участникам. Собирать целую команду не нужно.'],
  ['А если я давно не играл?', 'Ориентируйся на описание и правила конкретной игры: организатор может указать формат и подходящий уровень. Выбирай встречу, на которой тебе будет комфортно.'],
  ['Что я узнаю до записи?', 'В карточке игры указаны площадка и адрес, дата и длительность, свободные места, стоимость и правила. Сначала знакомишься с условиями, затем решаешь присоединиться.'],
  ['Нужно скачивать приложение?', 'Нет. RentZal открывается в браузере. Для записи понадобится аккаунт, а просмотреть каталог можно без входа.'],
  ['Где найти свои игры?', 'В разделе «Мои участия» собраны твои бронирования: площадка, время и статус участия. Войти можно через свой аккаунт.'],
];

export function FAQ() {
  return <Accordion className="faq-list" defaultValue={[0]}>{questions.map(([question, answer], index) => <AccordionItem key={question} value={index} className="faq-item"><AccordionTrigger className="faq-question"><span className="faq-number">0{index+1}</span><span>{question}</span></AccordionTrigger><AccordionContent className="faq-answer"><p>{answer}</p></AccordionContent></AccordionItem>)}</Accordion>;
}
