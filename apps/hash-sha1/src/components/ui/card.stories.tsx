import type { Meta, StoryObj } from '@storybook/react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';

const meta = {
  title: 'hash-sha1/UI/Card',
  component: Card,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>Card Description</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here.</p>
      </CardContent>
    </Card>
  ),
};

export const WithFooter: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Create Project</CardTitle>
        <CardDescription>Deploy your new project in one-click.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Configure your project settings below.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Deploy</Button>
      </CardFooter>
    </Card>
  ),
};

export const Simple: Story = {
  render: () => (
    <Card className="w-[350px] p-6">
      <p>A simple card with just content.</p>
    </Card>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>First Card</CardTitle>
          <CardDescription>This is the first card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>First card content</p>
        </CardContent>
      </Card>
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Second Card</CardTitle>
          <CardDescription>This is the second card</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Second card content</p>
        </CardContent>
      </Card>
    </div>
  ),
};
