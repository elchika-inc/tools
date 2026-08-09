import type { Meta, StoryObj } from '@storybook/react';
import { Label } from './label';
import { Input } from './input';

const meta = {
  title: 'datetime-countdown/UI/Label',
  component: Label,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Label>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: 'Label',
  },
};

export const WithInput: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="username">Username</Label>
      <Input id="username" placeholder="Enter your username" />
    </div>
  ),
};

export const Required: Story = {
  render: () => (
    <div className="w-[350px] space-y-2">
      <Label htmlFor="email">
        Email <span className="text-destructive">*</span>
      </Label>
      <Input id="email" type="email" placeholder="email@example.com" required />
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="w-[350px] space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input id="name" placeholder="Your name" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" placeholder="email@example.com" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message</Label>
        <Input id="message" placeholder="Your message" />
      </div>
    </div>
  ),
};
